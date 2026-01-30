import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { getIcon } from "@/lib/icons";
import type { HoursProps } from "@/types/config";

// Helper to check if currently open based on schedule
function isCurrentlyOpen(schedule: HoursProps["schedule"], timezone?: string): boolean {
  try {
    const now = timezone ? new Date(new Date().toLocaleString("en-US", { timeZone: timezone })) : new Date();
    const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert to Mon=0, Sun=6
    const entry = schedule[dayIndex];
    if (!entry || entry.closed) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTimeRange = (range: string): [number, number] | null => {
      const match = range.match(/(\d{1,2})[h:](\d{2})?\s*[-–]\s*(\d{1,2})[h:](\d{2})?/);
      if (!match) return null;
      const start = parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
      const end = parseInt(match[3]) * 60 + (parseInt(match[4]) || 0);
      return [start, end];
    };

    if (entry.continuous) {
      const range = parseTimeRange(entry.continuous);
      if (range && currentTime >= range[0] && currentTime < range[1]) return true;
    }
    if (entry.morning) {
      const range = parseTimeRange(entry.morning);
      if (range && currentTime >= range[0] && currentTime < range[1]) return true;
    }
    if (entry.afternoon) {
      const range = parseTimeRange(entry.afternoon);
      if (range && currentTime >= range[0] && currentTime < range[1]) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function Hours({ id, ...props }: HoursProps & { id: string }) {
  const { t, tui } = useLanguage();

  // Determine current day (0=Sunday, 1=Monday, ...)
  const today = new Date().getDay();
  // Default showOpenClosedBadge to true
  const showBadge = props.showOpenClosedBadge !== false;
  const isOpen = showBadge ? isCurrentlyOpen(props.schedule, props.timezone) : false;

  return (
    <section id={id} className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          {props.label && (
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-accent font-body mb-4">
              {t(props.label)}
            </span>
          )}
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6">
            {t(props.title)}
          </h2>
          {props.subtitle && (
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              {t(props.subtitle)}
            </p>
          )}
          {/* Open/Closed Badge */}
          {showBadge && (
            <div className="mt-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isOpen
                  ? "bg-[hsl(var(--status-success)/0.1)] text-[hsl(var(--status-success))]"
                  : "bg-[hsl(var(--status-error)/0.1)] text-[hsl(var(--status-error))]"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-[hsl(var(--status-success))]" : "bg-[hsl(var(--status-error))]"}`} />
                {isOpen ? tui("open", props.uiStrings?.open) : tui("closed", props.uiStrings?.closed)}
              </span>
            </div>
          )}
        </div>

        {/* Hours Table */}
        <div className="max-w-lg mx-auto">
          <div className="bg-card border border-border rounded-sm overflow-hidden shadow-[var(--shadow-soft)]">
            {props.schedule.map((entry, index) => {
              const isToday = props.showTodayBadge && index === (today === 0 ? 6 : today - 1);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between px-6 py-4 font-body ${
                    index < props.schedule.length - 1 ? "border-b border-border" : ""
                  } ${isToday ? "bg-accent/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{t(entry.day)}</span>
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
                        {tui("today", props.uiStrings?.today)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {entry.closed ? (
                      <span className="text-muted-foreground">{tui("closed", props.uiStrings?.closed)}</span>
                    ) : entry.continuous ? (
                      <span className="text-foreground">{entry.continuous}</span>
                    ) : (
                      <div className="flex gap-2 text-sm">
                        {entry.morning && <span className="text-foreground">{entry.morning}</span>}
                        {entry.morning && entry.afternoon && <span className="text-muted-foreground">|</span>}
                        {entry.afternoon && <span className="text-foreground">{entry.afternoon}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          {props.ctaButton && (() => {
            const CustomIcon = getIcon(props.ctaButton.icon);
            const Icon = CustomIcon || (props.ctaButton.phone ? Phone : null);
            const iconPosition = props.ctaButton.iconPosition || "left";
            return (
              <div className="mt-8 text-center">
                <Button
                  variant="accent"
                  size="xl"
                  className="w-full"
                  asChild
                >
                  <a href={props.ctaButton.phone ? `tel:${props.ctaButton.phone.replace(/\s/g, "")}` : props.ctaButton.href || "#"}>
                    {Icon && iconPosition === "left" && <Icon className="w-4 h-4 mr-2" />}
                    {t(props.ctaButton.label)}
                    {Icon && iconPosition === "right" && <Icon className="w-4 h-4 ml-2" />}
                  </a>
                </Button>
              </div>
            );
          })()}

          {/* Payment Methods */}
          {props.paymentMethods && props.paymentMethods.length > 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground font-body">
              {tui("paymentMethods", props.uiStrings?.paymentMethods)}: {props.paymentMethods.join(" & ")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
