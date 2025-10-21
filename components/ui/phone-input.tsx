"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange" | "value"> & {
    onChange?: (value: string | undefined) => void
    value?: string
    isValidating?: boolean
    validationError?: string
  }

const PhoneInput: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<PhoneInputProps> & React.RefAttributes<React.ElementRef<typeof RPNInput.default>>
> = React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
  ({ className, onChange, value, isValidating, validationError, ...props }, ref) => {
    // Convert display value (3054288892) to library format (+923054288892) for internal use
    const libraryValue = value && !value.startsWith('+') ? `+92${value.replace(/\D/g, '')}` as RPNInput.Value : value as RPNInput.Value;
    
    const handleChange = (libValue: RPNInput.Value | undefined) => {
      if (libValue && typeof libValue === 'string') {
        // Convert back to display format (remove +92 prefix)
        const displayValue = libValue.replace(/^\+92/, '');
        onChange?.(displayValue);
      } else {
        onChange?.(undefined);
      }
    };
    
    return (
      <div className="relative">
        <RPNInput.default
          ref={ref}
          className={cn("flex rounded-full", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelectComponent}
          inputComponent={InputComponent}
          value={libraryValue}
          onChange={handleChange}
          {...props}
        />
        {isValidating && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {validationError && (
          <p className="text-sm text-red-500 mt-2">{validationError}</p>
        )}
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, value, onChange, ...props }, ref) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '') // Only digits
    
    // Pakistan number limit (10 digits)
    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10)
    }
    
    // No formatting - just plain digits (3054288892)
    // Remove spaces to show continuous digits
    
    // Create synthetic event with clean value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue
      }
    }
    
    onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <Input
      className={cn(
        "rounded-l-none rounded-r-full border-l-0 focus:ring-0 focus:ring-offset-0 h-16 px-6 text-base",
        className
      )}
      {...props}
      value={value}
      onChange={handleInputChange}
      placeholder="3054288892"
      maxLength={10} // Just 10 digits, no spaces
      ref={ref}
    />
  )
})
InputComponent.displayName = "InputComponent"

type CountrySelectOption = { label: string; value: RPNInput.Country }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: CountrySelectOption[]
}

const CountrySelectComponent = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      // Show message for countries other than Pakistan
      if (country !== "PK") {
        alert("This country is not available yet. Only Pakistan is currently supported.")
        return
      }
      onChange(country)
    },
    [onChange]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "flex gap-2 rounded-l-full rounded-r-none border-r-0 px-4 h-16",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown className={cn("h-4 w-4 opacity-50")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className="gap-2"
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    {option.value === "PK" && (
                      <span className="text-xs text-green-600 font-medium">(Available)</span>
                    )}
                    {option.value !== "PK" && (
                      <span className="text-xs text-muted-foreground">(Not available)</span>
                    )}
                    {option.value === value && (
                      <CheckIcon className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className="flex h-10 w-12 overflow-hidden rounded-sm items-center justify-center">
      {Flag && (
        <div className="w-full h-full flex items-center justify-center">
          <Flag title={countryName} />
        </div>
      )}
    </span>
  )
}
FlagComponent.displayName = "FlagComponent"

export { PhoneInput }
