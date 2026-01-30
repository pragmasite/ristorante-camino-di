import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DisclaimerConfig } from "@/types/config";
import { AlertTriangle } from "lucide-react";
import { getIcon } from "@/lib/icons";

const STORAGE_KEY = "siteforge-disclaimer-dismissed";

interface DisclaimerModalProps {
  disclaimer?: DisclaimerConfig;
}

export function DisclaimerModal({ disclaimer }: DisclaimerModalProps) {
  const { t, tui } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  // Get the icon component dynamically
  const iconName = disclaimer?.icon || "AlertTriangle";
  const IconComponent = getIcon(iconName) || AlertTriangle;

  // Get content - use custom values or fall back to defaults
  const title = disclaimer?.title ? t(disclaimer.title) : tui("disclaimer.title");
  const message = disclaimer?.message ? t(disclaimer.message) : tui("disclaimer.message");
  const buttonLabel = disclaimer?.buttonLabel ? t(disclaimer.buttonLabel) : tui("disclaimer.button");

  // Bullet points - use custom or default
  const bulletPoints = disclaimer?.bulletPoints
    ? disclaimer.bulletPoints.map(bp => t(bp))
    : [
        tui("disclaimer.notIndexed"),
        tui("disclaimer.mayContainErrors"),
      ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center sm:items-start">
          <div className="mx-auto sm:mx-0 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-heading text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            {message}
          </DialogDescription>
        </DialogHeader>

        {bulletPoints.length > 0 && (
          <ul className="my-4 space-y-2">
            {bulletPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                {point}
              </li>
            ))}
          </ul>
        )}

        <Button onClick={handleDismiss} className="w-full">
          {buttonLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
