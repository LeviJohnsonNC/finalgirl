import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { GameResult } from '@/hooks/useGameHistory';
import { ScrapbookGrid } from './ScrapbookGrid';
import { ScrapbookStoryPage } from './ScrapbookStoryPage';
import { ScrapbookPolaroid } from './ScrapbookPolaroid';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import finalGirlCover from '@/assets/scrapbooks/final-girl-cover.png';
import killerCover from '@/assets/scrapbooks/killer-cover.png';

interface ScrapbookBookProps {
  type: 'finalGirl' | 'killer';
  games: GameResult[];
  onClose: () => void;
  onUpdateGame: (id: string, updates: Partial<GameResult>) => void;
  onDeleteGame: (id: string) => Promise<void> | void;
  onFetchGameDetails: (id: string) => Promise<GameResult | null>;
}

// Resize and compress image before upload
const resizeImage = (file: File, maxWidth: number = 1200): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const ScrapbookBook = ({ type, games, onClose, onUpdateGame, onDeleteGame, onFetchGameDetails }: ScrapbookBookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  // Trigger open animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 800);
  };

  const handleDeleteConfirm = async () => {
    if (selectedGame) {
      await onDeleteGame(selectedGame.id);
      setSelectedGame(null);
      setShowDeleteConfirm(false);
      toast.success('Record destroyed');
    }
  };

  const handleSelectGame = useCallback(async (game: GameResult) => {
    setSelectedGame(game);
    if (game.introStory || game.endingNarration || game.gameHighlights) return;
    setIsLoadingStory(true);
    try {
      const fullGame = await onFetchGameDetails(game.id);
      if (fullGame) setSelectedGame(fullGame);
    } finally {
      setIsLoadingStory(false);
    }
  }, [onFetchGameDetails]);

  const handlePosterUpload = useCallback(async (file: File) => {
    if (!selectedGame) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (!user) {
      toast.error('You must be signed in to upload');
      return;
    }

    setIsUploading(true);
    try {
      const resizedBlob = await resizeImage(file);
      const fileName = `${selectedGame.id}-${Date.now()}.jpg`;
      const filePath = `game-posters/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(filePath, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload poster');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);

      onUpdateGame(selectedGame.id, { posterImageUrl: urlData.publicUrl });
      setSelectedGame(prev => prev ? { ...prev, posterImageUrl: urlData.publicUrl } : null);
      toast.success('Poster added!');
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, [selectedGame, onUpdateGame, user]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePosterUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const coverImage = type === 'finalGirl' ? finalGirlCover : killerCover;
  const themeClass = type === 'finalGirl' ? 'scrapbook-theme-survivor' : 'scrapbook-theme-killer';
  const selectedPosterUrl = selectedGame?.posterImageUrl;
  const selectedSceneUrl = selectedGame?.sceneImageUrl;

  return (
    <div className={`fixed inset-0 z-50 ${isMobile ? 'overflow-y-auto' : 'flex items-center justify-center'}`}>
      {/* Backdrop */}
      <div 
        className={`${isMobile ? 'fixed inset-0' : 'absolute inset-0'} bg-black/90 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Book Container */}
      <div 
        className={`scrapbook-container ${themeClass} ${isOpen ? 'book-open' : ''} ${isMobile ? 'relative z-10' : ''}`}
        style={isMobile ? undefined : { perspective: '2000px' }}
      >
        {/* Close Button — desktop: floats outside book; mobile: fixed top-right corner */}
        <button
          onClick={handleClose}
          className={
            isMobile
              ? 'fixed top-4 right-4 z-[60] p-2 rounded-full bg-background/80 backdrop-blur border border-border text-foreground shadow-lg'
              : 'absolute -top-12 right-0 sm:top-4 sm:-right-12 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors'
          }
        >
          <X className="w-6 h-6" />
        </button>

        {/* Book */}
        <div className="scrapbook-book">
          {/* Front Cover (flips open) - hidden on mobile via CSS */}
          <div className={`scrapbook-cover ${isOpen ? 'cover-open' : ''}`}>
            <img
              src={coverImage}
              alt={type === 'finalGirl' ? 'Final Girl Scrapbook' : 'Killer Scrapbook'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Inside Pages */}
          <div className={`scrapbook-pages ${isOpen || isMobile ? 'pages-visible' : ''}`}>
            {/* Polaroid - only on desktop */}
            {!isMobile && selectedSceneUrl && (
              <ScrapbookPolaroid sceneImageUrl={selectedSceneUrl} />
            )}

            {isMobile ? (
              /* ===== MOBILE: Single column layout ===== */
              <div className="scrapbook-page scrapbook-page-right w-full">
                <div className="page-content">
                  {selectedGame ? (
                    <div className="story-display">
                      {/* Back button row */}
                      <div className="flex items-center mb-3">
                        <button
                          onClick={() => setSelectedGame(null)}
                          className="back-to-grid flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Back to Grid
                        </button>
                      </div>

                      {/* Poster above story on mobile */}
                      {selectedPosterUrl ? (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={selectedPosterUrl}
                            alt="Game Poster"
                            className="max-h-[200px] w-auto object-contain border-4 border-[hsl(30_20%_25%)] shadow-lg"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="mb-4">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="no-poster clickable-poster w-full h-[120px]"
                          >
                            {isUploading ? (
                              <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
                            ) : (
                              <Upload className="w-6 h-6 text-muted-foreground/40 mb-1" />
                            )}
                            <span className="font-display text-xs text-dim">
                              {isUploading ? 'Uploading...' : 'Upload Poster'}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Scene image on mobile */}
                      {selectedSceneUrl && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={selectedSceneUrl}
                            alt="Scene"
                            className="max-h-[180px] w-auto object-contain rounded-sm shadow-md"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}

                      {isLoadingStory ? (
                        <p className="type-label text-muted-foreground text-center py-6 animate-pulse">Recovering full case file...</p>
                      ) : (
                        <ScrapbookStoryPage game={selectedGame} type={type} onDelete={() => setShowDeleteConfirm(true)} />
                      )}
                    </div>
                  ) : (
                    <ScrapbookGrid
                      games={games}
                      selectedGameId={null}
                      onSelectGame={handleSelectGame}
                      type={type}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* ===== DESKTOP: Two-page spread ===== */
              <>
                {/* Left Page - Poster Display */}
                <div className="scrapbook-page scrapbook-page-left">
                  <div className="page-content">
                    {selectedGame ? (
                      <div className="poster-display">
                        {selectedPosterUrl ? (
                          <img
                            src={selectedPosterUrl}
                            alt="Game Poster"
                            className="w-full h-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="no-poster clickable-poster"
                          >
                            {isUploading ? (
                              <Loader2 className="w-8 h-8 text-muted-foreground/40 animate-spin" />
                            ) : (
                              <Upload className="w-8 h-8 text-muted-foreground/40 mb-2" />
                            )}
                            <span className="font-display text-sm text-dim">
                              {isUploading ? 'Uploading...' : 'Click to Upload Poster'}
                            </span>
                          </button>
                        )}
                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <div className="poster-info">
                          <p className="type-caption">{selectedGame.finalGirl}</p>
                          <p className="type-caption text-muted-foreground">
                            vs {selectedGame.killer}
                          </p>
                          <p className="type-caption text-muted-foreground">
                            {selectedGame.location}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-page">
                        <p className="type-label text-muted-foreground text-center px-4">
                          Select a story from the grid to view its poster
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Page - Grid or Story */}
                <div className="scrapbook-page scrapbook-page-right">
                  <div className="page-content">
                    {selectedGame ? (
                      <div className="story-display">
                        {/* Back button row */}
                        <div className="flex justify-between items-center mb-2">
                          <button
                            onClick={() => setSelectedGame(null)}
                            className="back-to-grid"
                          >
                            ← Back to Grid
                          </button>
                        </div>
                        {isLoadingStory ? (
                          <p className="type-label text-muted-foreground text-center py-6 animate-pulse">Recovering full case file...</p>
                        ) : (
                          <ScrapbookStoryPage game={selectedGame} type={type} onDelete={() => setShowDeleteConfirm(true)} />
                        )}
                      </div>
                    ) : (
                      <ScrapbookGrid
                        games={games}
                        selectedGameId={null}
                        onSelectGame={handleSelectGame}
                        type={type}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Hidden file input for mobile */}
          {isMobile && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          )}

          {/* Back Cover (static) */}
          <div className="scrapbook-back" />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
