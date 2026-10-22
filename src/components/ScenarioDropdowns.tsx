import { useState, useMemo, useId } from 'react';
import { Dices, Clapperboard, MapPin, Crosshair, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  setupValue?: string | null;
  eventValue?: string | null;
  missionValue?: string | null;
  selectedLocation: string | null;
  onSetupChange?: (setup: string | null) => void;
  onEventChange?: (event: string | null) => void;
  onMissionChange?: (mission: string | null) => void;
}

const ScenarioDropdownsForLocation = ({ 
  selectedLocation, 
  onSetupChange, 
  onEventChange,
  onMissionChange, setupValue, eventValue, missionValue
}: ScenarioDropdownsProps) => {
  const [localSetup, setSelectedSetup] = useState<string | null>(null);
  const [localEvent, setSelectedEvent] = useState<string | null>(null);
  const [localMission, setSelectedMission] = useState<string | null>(null);
  const selectedSetup = setupValue === undefined ? localSetup : setupValue;
  const selectedEvent = eventValue === undefined ? localEvent : eventValue;
  const selectedMission = missionValue === undefined ? localMission : missionValue;
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
          <span className="casting-console-icon" aria-hidden="true"><Clapperboard /></span>
          Setup Scenario
        </label>
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
                className="casting-console-option"
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
          <span className="casting-console-icon" aria-hidden="true"><MapPin /></span>
          Event
        </label>
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
                className="casting-console-option"
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
            <span className="casting-console-icon" aria-hidden="true"><Crosshair /></span>
            Mission
          </label>
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
                    className="casting-console-option"
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
          {selectedMissionData && <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="casting-mission-info" aria-label="Read mission details">
                <Info aria-hidden="true" />
                <span>Mission details</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="casting-mission-details" side="top" collisionPadding={16} aria-labelledby={`${id}-mission-title`}>
              <h3 id={`${id}-mission-title`}>{selectedMissionData.name}</h3>
              <p className="casting-console-mission-description">{selectedMissionData.description}</p>
            </PopoverContent>
          </Popover>}
        </div>
      )}
    </div>

  );
};


export const ScenarioDropdowns = (props: ScenarioDropdownsProps) => (
  <ScenarioDropdownsForLocation key={props.selectedLocation ?? 'none'} {...props} />
);

