import { useState, useMemo, useId } from 'react';
import { Dices, Clapperboard, MapPin, Crosshair } from 'lucide-react';
import { getFilmIdByLocation } from '@/types/gameData';
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

const ScenarioDropdownsForLocation = ({ 
  selectedLocation, 
  onSetupChange, 
  onEventChange,
  onMissionChange
}: ScenarioDropdownsProps) => {
  const [selectedSetup, setSelectedSetup] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const id = useId();

  const filmId = selectedLocation ? getFilmIdByLocation(selectedLocation) : null;
  
  const setupCards = useMemo(() => {
    if (!filmId) return [];
    return getSetupCardsForLocation(filmId);
  }, [filmId]);

  const events = useMemo(() => {
    if (!filmId) return [];
    return getEventsForLocation(filmId);
  }, [filmId]);

  const showMissions = locationHasMissions(selectedLocation);
  const selectedMissionData = getMissionByName(selectedMission);

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

  return (
    <div className="casting-console-fields">
      {/* Setup Scenario Dropdown */}
      <div className="casting-console-field">
        <label htmlFor={`${id}-setup`} className="casting-console-label">
          Setup Scenario
        </label>
        <span className="casting-console-icon casting-console-icon--setup" aria-hidden="true"><Clapperboard /></span>
        <Select 
          value={selectedSetup || undefined} 
          onValueChange={handleSetupChange}
          disabled={setupCards.length === 0}
        >
          <SelectTrigger id={`${id}-setup`} aria-label="Setup Scenario" className="casting-console-select">
            <SelectValue placeholder={!selectedLocation ? "Choose location first" : setupCards.length > 0 ? "Select Setup..." : "Coming Soon"} />
          </SelectTrigger>
          <SelectContent className="scenario-dropdown-content casting-console-menu" side="top">
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
      <div className="casting-console-field casting-console-field--event">
        <label htmlFor={`${id}-event`} className="casting-console-label">
          Event
        </label>
        <span className="casting-console-icon" aria-hidden="true"><MapPin /></span>
        <Select 
          value={selectedEvent || undefined} 
          onValueChange={handleEventChange}
          disabled={events.length === 0}
        >
          <SelectTrigger id={`${id}-event`} aria-label="Starting Event" className="casting-console-select">
            <SelectValue placeholder={!selectedLocation ? "Choose location first" : events.length > 0 ? "Select Event..." : "Coming Soon"} />
          </SelectTrigger>
          <SelectContent className="scenario-dropdown-content casting-console-menu" side="top">
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
        <div className="casting-console-field casting-console-field--mission">
          <label htmlFor={`${id}-mission`} className="casting-console-label">
            Mission
          </label>
          <span className="casting-console-icon" aria-hidden="true"><Crosshair /></span>
          <div className="casting-console-mission-controls">
            <Select
              value={selectedMission || undefined}
              onValueChange={handleMissionChange}
            >
              <SelectTrigger id={`${id}-mission`} aria-label="Mission" className="casting-console-select">
                <SelectValue placeholder="Select Mission..." />
              </SelectTrigger>
              <SelectContent className="scenario-dropdown-content casting-console-menu" side="top">
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
              className="casting-console-draw"
            >
              <Dices className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Draw</span>
            </button>
          </div>
          {selectedMissionData && (
            <p className="casting-console-mission-description type-caption text-muted-foreground/80 italic">
              {selectedMissionData.description}
            </p>
          )}
        </div>
      )}
    </div>

  );
};


export const ScenarioDropdowns = (props: ScenarioDropdownsProps) => (
  <ScenarioDropdownsForLocation key={props.selectedLocation ?? 'none'} {...props} />
);

