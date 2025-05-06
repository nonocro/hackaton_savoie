import { useEffect, useRef, useState } from "react";

import { MapPinIcon } from "@heroicons/react/24/outline";
import * as Geocode from "react-geocode";
import useGoogle from "react-google-autocomplete/lib/usePlacesAutocompleteService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

Geocode.setKey(import.meta.env.VITE_GOOGLE_API_KEY ?? "");

export interface LocationInfo {
  city: string;
  latitude: number;
  longitude: number;
}

interface AddressInputProps {
  value: string;
  onChange: (location: LocationInfo | undefined) => void;
  className?: string;
  inputClassName?: string;
  isFixed?: boolean;
}

export function AddressInput({
  value,
  onChange,
  className,
  inputClassName,
  isFixed,
}: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [location, setLocation] = useState<LocationInfo>();

  useEffect(() => {
    onChange(location);
  }, [onChange, location]);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const handleClickOutside = () => {
    setOpen(false);
  };

  const predictionRef = useOutsideClick(handleClickOutside);
  const predictionButtonRefs = useRef<HTMLButtonElement[]>([]);

  function setPredictionButtonRef(
    buttonElement: HTMLButtonElement | null,
    index: number
  ) {
    if (!buttonElement) {
      return;
    }

    predictionButtonRefs.current[index] = buttonElement;
  }

  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    useGoogle({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      options: {
        types: ["locality"],
        input: "input",
      },
    });

  useEffect(() => {
    predictionButtonRefs.current = predictionButtonRefs.current.slice(
      0,
      placePredictions.length
    );
  }, [placePredictions]);

  function handleArrowDown() {
    if (predictionButtonRefs.current.length === 0) {
      return;
    }

    const currentIndex = predictionButtonRefs.current.findIndex(
      (refcurrent) => refcurrent === document.activeElement
    );

    if (currentIndex !== -1) {
      const nextIndex =
        (currentIndex + 1) % predictionButtonRefs.current.length;

      predictionButtonRefs.current[nextIndex].focus();
    } else {
      predictionButtonRefs.current[0].focus();
    }
  }

  function handleArrowUp() {
    if (predictionButtonRefs.current.length === 0) {
      return;
    }

    const currentIndex = predictionButtonRefs.current.findIndex(
      (refCurrent) => refCurrent === document.activeElement
    );

    if (currentIndex !== -1) {
      const prevIndex =
        (currentIndex - 1 + predictionButtonRefs.current.length) %
        predictionButtonRefs.current.length;

      predictionButtonRefs.current[prevIndex].focus();
    } else {
      predictionButtonRefs.current[
        predictionButtonRefs.current.length - 1
      ].focus();
    }
  }

  useKeyboardNavigation(handleArrowDown, handleArrowUp);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setOpen(true);
    getPlacePredictions({ input: event.target.value });
    setInputValue(event.target.value);
  }

  async function onPredictionClick(
    item: google.maps.places.AutocompletePrediction
  ) {
    setInputValue(item.description);

    const response = await Geocode.fromAddress(item.description);
    const { lat: latitude, lng: longitude } =
      response.results[0].geometry.location;
    const [, city] = item.description.split(", ").reverse();

    setLocation({ city, latitude, longitude });
    setOpen(false);
  }

  return (
    <div className="relative flex flex-col gap-y-2">
      <div className={cn("relative ml-0 w-full", className)}>
        <Input
          className={cn(inputClassName)}
          value={inputValue}
          placeholder="Indiquez une ville"
          onChange={(event) => onInputChange(event)}
          id="location-input"
        />
        {isPlacePredictionsLoading && (
          <div className="absolute right-3 top-[12px] h-5 w-5 animate-spin rounded-full border-t-2 border-primary" />
        )}
        {!isPlacePredictionsLoading && (
          <Search className="absolute right-2 top-[9px] h-6 w-6 opacity-50" />
        )}
      </div>
      {!isPlacePredictionsLoading && (
        <div
          ref={predictionRef}
          className={cn(
            "z-50 mt-[45px] w-full rounded-xl border bg-background p-3",
            (!open || !inputValue) && "hidden",
            isFixed ? "fixed" : "absolute"
          )}
          style={isFixed ? { top: 0 } : undefined}
        >
          <div className="flex flex-col items-start gap-y-1">
            {placePredictions.length > 0 ? (
              placePredictions.map((prediction, index) => (
                <Button
                  ref={(buttonElement) =>
                    setPredictionButtonRef(buttonElement, index)
                  }
                  className="flex h-fit w-full items-center justify-start gap-x-2 whitespace-nowrap bg-background text-sm text-muted-foreground hover:bg-primary hover:text-black focus:bg-secondary focus:text-black focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-background dark:hover:text-white dark:focus:text-white"
                  key={prediction.description}
                  onClick={() => onPredictionClick(prediction)}
                  type="button"
                >
                  <MapPinIcon className="h-5 w-5" />
                  {prediction.description}
                </Button>
              ))
            ) : (
              <p className="pr-4 text-muted-foreground">Aucune ville trouvée</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
