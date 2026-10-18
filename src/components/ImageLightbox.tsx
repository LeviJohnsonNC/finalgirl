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
    <DialogContent className="image-lightbox w-fit max-w-[96vw] sm:max-w-[96vw] p-0 sm:p-0 bg-transparent border-0 rounded-none overflow-visible" aria-describedby={undefined}>
      <DialogTitle className="sr-only">{caption}</DialogTitle>
      <div className="image-lightbox-mount relative">
        <img
          src={imageUrl}
          alt={caption}
          className="block w-auto h-auto max-w-[96vw] max-h-[92dvh] object-contain bg-black"
        />
        <div className="image-lightbox-edge" aria-hidden="true" />
        <div className="vignette absolute inset-0 pointer-events-none" />
      </div>
    </DialogContent>
  </Dialog>
);
