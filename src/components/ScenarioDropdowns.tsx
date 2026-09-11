import { useState, useMemo } from 'react';
import { ChevronDown, Dices } from 'lucide-react';
import { getFilmIdByLocation, FEATURE_FILMS } from '@/types/gameData';
import { getSetupCardsForLocation, getEventsForLocation } from '@/types/featureFilmDetails';
import {
  FALCONWOOD_MISSIONS,
  getMissionByName,
  getRandomMission,
  locationHasMissions,
} from '@/data/falconwoodMissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScenarioDropdownsProps {
  selectedLocation: string | null;
  onSetupChange?: (setup: string | null) => void;
  onEventChange?: (event: string | null) => void;
  onMissionChange?: (mission: string | null) => void;
}

export const ScenarioDropdowns = ({ 
  selectedLocation, 
  onSetupChange, 
  onEventChange,
  onMissionChange
}: ScenarioDropdownsProps) => {
  const [selectedSetup, setSelectedSetup] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const filmId = selectedLocation ? getFilmIdByLocation(selectedLocation) : null;
  
  const setupCards = useMemo(() => {
    if (!filmId) return [];
    return getSetupCardsForLocation(filmId);
  }, [filmId]);

  const events = useMemo(() => {
    if (!filmId) return [];
    return getEventsForLocation(filmId);
  }, [filmId]);

  const hasData = setupCards.length > 0 || events.length > 0;
  const showMissions = locationHasMissions(selectedLocation);
  const selectedMissionData = getMissionByName(selectedMission);

  const selectedSetupData = setupCards.find(s => s.name === selectedSetup);
  const selectedEventData = events.find(e => e.name === selectedEvent);

  const handleSetupChange = (value: string) => {
    setSelectedSetup(value);
    onSetupChange?.(value);
  };

  const handleEventChange = (value: string) => {
    setSelectedEvent(value);
    onEventChange?.(value);
  };

  const handleMissionChange = (value: string) => {
    setSelectedMission(value);
    onMissionChange?.(value);
  };

  const handleRandomMission = () => {
    handleMissionChange(getRandomMission().name);
  };

  if (!selectedLocation) {
    return null;
  }


  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Setup Scenario Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="font-display text-xs text-muted-foreground tracking-[0.2em] uppercase">
            Setup Scenario
          </label>
          <Select 
            value={selectedSetup || undefined} 
            onValueChange={handleSetupChange}
            disabled={setupCards.length === 0}
          >
            <SelectTrigger className="scenario-dropdown font-display text-xs sm:text-sm tracking-wider uppercase min-h-[44px]">
              <SelectValue placeholder={setupCards.length > 0 ? "Select Setup..." : "Coming Soon"} />
            </SelectTrigger>
            <SelectContent className="scenario-dropdown-content" side="top">
              {setupCards.map((card) => (
                <SelectItem 
                  key={card.name} 
                  value={card.name}
                  className="font-display text-xs sm:text-sm tracking-wide uppercase cursor-pointer focus:bg-primary/20 focus:text-primary-foreground data-[highlighted]:bg-primary/20 data-[highlighted]:text-foreground min-h-[44px]"
                >
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="font-display text-xs text-muted-foreground tracking-[0.2em] uppercase">
            Event
          </label>
          <Select 
            value={selectedEvent || undefined} 
            onValueChange={handleEventChange}
            disabled={events.length === 0}
          >
            <SelectTrigger className="scenario-dropdown font-display text-xs sm:text-sm tracking-wider uppercase min-h-[44px]">
              <SelectValue placeholder={events.length > 0 ? "Select Event..." : "Coming Soon"} />
            </SelectTrigger>
            <SelectContent className="scenario-dropdown-content" side="top">
              {events.map((event) => (
                <SelectItem 
                  key={event.name} 
                  value={event.name}
                  className="font-display text-xs sm:text-sm tracking-wide uppercase cursor-pointer focus:bg-primary/20 focus:text-primary-foreground data-[highlighted]:bg-primary/20 data-[highlighted]:text-foreground min-h-[44px]"
                >
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mission — Falconwood only. Drawn at random by the official rules,
            so the dice button sits beside the list. */}
        {showMissions && (
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-display text-xs text-muted-foreground tracking-[0.2em] uppercase">
              Mission
            </label>
            <div className="flex items-stretch gap-2">
              <Select
                value={selectedMission || undefined}
                onValueChange={handleMissionChange}
              >
                <SelectTrigger className="scenario-dropdown font-display text-xs sm:text-sm tracking-wider uppercase min-h-[44px] flex-1">
                  <SelectValue placeholder="Select Mission..." />
                </SelectTrigger>
                <SelectContent className="scenario-dropdown-content" side="top">
                  {FALCONWOOD_MISSIONS.map((mission) => (
                    <SelectItem
                      key={mission.name}
                      value={mission.name}
                      className="font-display text-xs sm:text-sm tracking-wide uppercase cursor-pointer focus:bg-primary/20 focus:text-primary-foreground data-[highlighted]:bg-primary/20 data-[highlighted]:text-foreground min-h-[44px]"
                    >
                      {mission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={handleRandomMission}
                aria-label="Draw a random mission"
                title="Draw a random mission"
                className="vcr-tape-button flex items-center justify-center gap-2 px-4 min-h-[44px] font-display text-xs tracking-[0.15em] uppercase"
              >
                <Dices className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Draw</span>
              </button>
            </div>
            {selectedMissionData && (
              <p className="type-caption text-muted-foreground/80 italic">
                {selectedMissionData.description}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
