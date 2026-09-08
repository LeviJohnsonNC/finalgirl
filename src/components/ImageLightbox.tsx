import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ImageLightboxProps {
  imageUrl: string;
  /** Screen-reader title, and the grease-pencil slug shown under the image. */
  caption: string;
  children: React.ReactNode;
}

/**
 * Full-size view of a generated still. The art is the reason the page exists —
 * a 400px rail shouldn't be the only way to look at it.
 */
export const ImageLightbox = ({ imageUrl, caption, children }: ImageLightboxProps) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-[92vw] sm:max-w-4xl p-0 bg-card border-border overflow-hidden">
      <DialogTitle className="sr-only">{caption}</DialogTitle>
      <div className="relative">
        <img
          src={imageUrl}
          alt={caption}
          className="w-full h-auto max-h-[80vh] object-contain bg-black"
        />
        <div className="film-grain absolute inset-0 pointer-events-none opacity-[0.12]" />
        <div className="vignette absolute inset-0 pointer-events-none" />
      </div>
      <p className="film-frame-caption font-vhs text-[10px] tracking-[0.25em] uppercase text-muted-foreground px-4 py-3">
        {caption}
      </p>
    </DialogContent>
  </Dialog>
);
