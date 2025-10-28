import { Switch } from "@hypr/ui/components/ui/switch";

interface SettingItem {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

interface AppSettingsViewProps {
  autostart: SettingItem;
  notificationDetect: SettingItem;
  saveRecordings: SettingItem;
  telemetryConsent: SettingItem;
}

export function AppSettingsView({
  autostart,
  notificationDetect,
  saveRecordings,
  telemetryConsent,
}: AppSettingsViewProps) {
  return (
    <div>
      <h2 className="font-semibold mb-4">App</h2>
      <div className="space-y-6">
        <SettingRow
          title={autostart.title}
          description={autostart.description}
          checked={autostart.value}
          onChange={autostart.onChange}
        />
        <SettingRow
          title={notificationDetect.title}
          description={notificationDetect.description}
          checked={notificationDetect.value}
          onChange={notificationDetect.onChange}
        />
        <SettingRow
          title={saveRecordings.title}
          description={saveRecordings.description}
          checked={saveRecordings.value}
          onChange={saveRecordings.onChange}
        />
        <SettingRow
          title={telemetryConsent.title}
          description={telemetryConsent.description}
          checked={telemetryConsent.value}
          onChange={telemetryConsent.onChange}
        />
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
