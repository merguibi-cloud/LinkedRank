import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, ImageIcon, Film, FileText, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

export type MediaPickerItem = {
  id: number;
  fileUrl: string;
  fileKey: string;
  title: string | null;
  mediaType: string;
};

export type MediaSuggestionItem = MediaPickerItem & {
  relevanceScore: number;
  matchReason: string;
};

interface MediaLibraryPickerProps {
  selectedId?: number | null;
  onSelect: (item: MediaPickerItem) => void;
  mediaType?: "image" | "video" | "document";
  className?: string;
  suggestions?: MediaSuggestionItem[];
  hasRelevantMatch?: boolean;
  onSwitchToAi?: () => void;
}

const TYPE_ICONS = {
  image: ImageIcon,
  video: Film,
  document: FileText,
};

function MediaGridItem({
  item,
  isSelected,
  isSuggested,
  score,
  onSelect,
}: {
  item: MediaPickerItem;
  isSelected: boolean;
  isSuggested?: boolean;
  score?: number;
  onSelect: () => void;
}) {
  const Icon = TYPE_ICONS[item.mediaType as keyof typeof TYPE_ICONS] ?? ImageIcon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
        isSelected
          ? "border-amber-500 ring-2 ring-amber-500/30"
          : isSuggested
            ? "border-emerald-600/60 hover:border-emerald-500"
            : "border-transparent hover:border-amber-700/50"
      )}
    >
      {item.mediaType === "image" ? (
        <img
          src={item.fileUrl}
          alt={item.title ?? "Média"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center p-2">
          <Icon className="w-6 h-6 text-muted-foreground mb-1" />
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
            {item.title ?? "Média"}
          </span>
        </div>
      )}
      {isSuggested && score !== undefined && score >= 60 && (
        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-600/90 text-white">
          {score}%
        </span>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-amber-400" />
        </div>
      )}
    </button>
  );
}

export function MediaLibraryPicker({
  selectedId,
  onSelect,
  mediaType = "image",
  className,
  suggestions = [],
  hasRelevantMatch,
  onSwitchToAi,
}: MediaLibraryPickerProps) {
  const { data, isLoading } = trpc.mediaLibrary.list.useQuery({
    limit: 30,
    mediaType,
  });

  const items = data?.items ?? [];
  const suggestedIds = new Set(suggestions.map(s => s.id));
  const otherItems = items.filter(item => !suggestedIds.has(item.id));

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-3 gap-2", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Aucun visuel dans votre médiathèque.
        </p>
        {onSwitchToAi && (
          <button
            type="button"
            onClick={onSwitchToAi}
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
          >
            <Sparkles className="w-4 h-4" />
            Générer une image IA à la place
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-400/90">
            {hasRelevantMatch
              ? "Recommandés pour ce post"
              : "Aucun visuel ne correspond vraiment — parcourez ou générez une image IA"}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {suggestions.map(item => (
              <div key={item.id} className="space-y-1">
                <MediaGridItem
                  item={item}
                  isSelected={selectedId === item.id}
                  isSuggested
                  score={item.relevanceScore}
                  onSelect={() => onSelect(item)}
                />
                {item.matchReason && selectedId === item.id && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 px-0.5">
                    {item.matchReason}
                  </p>
                )}
              </div>
            ))}
          </div>
          {!hasRelevantMatch && onSwitchToAi && (
            <button
              type="button"
              onClick={onSwitchToAi}
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
            >
              <Sparkles className="w-4 h-4" />
              Générer une image IA
            </button>
          )}
        </div>
      )}

      {otherItems.length > 0 && (
        <div className="space-y-2">
          {suggestions.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground">Tous vos visuels</p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {otherItems.map(item => (
              <MediaGridItem
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={() => onSelect(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MediaUploadZoneProps {
  onUploaded?: () => void;
  compact?: boolean;
}

export function MediaUploadZone({ onUploaded, compact }: MediaUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const uploadMutation = trpc.mediaLibrary.upload.useMutation({
    onSuccess: () => {
      utils.mediaLibrary.list.invalidate();
      onUploaded?.();
    },
  });

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({
        fileName: file.name,
        mimeType: file.type,
        base64Data: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={cn(
        "border border-dashed border-amber-700/30 rounded-lg text-center cursor-pointer hover:border-amber-600/50 transition-colors",
        compact ? "p-3" : "p-6"
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <ImageIcon className={cn("mx-auto text-muted-foreground", compact ? "w-5 h-5" : "w-8 h-8")} />
      <p className={cn("text-muted-foreground mt-2", compact ? "text-xs" : "text-sm")}>
        {uploadMutation.isPending ? "Téléversement..." : "Ajouter un visuel"}
      </p>
    </div>
  );
}
