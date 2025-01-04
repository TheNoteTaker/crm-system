import { Card, CardHeader, CardContent } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { formatDistanceToNow } from 'date-fns';

export function AutomationRuleList({ rules, onToggle }) {
  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {rule.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Created {formatDistanceToNow(new Date(rule.created_at))} ago
                </p>
              </div>
              <Switch
                checked={rule.is_active}
                onChange={(checked) => onToggle(rule.id, checked)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trigger
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {rule.trigger_type.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Action
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {rule.action_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}