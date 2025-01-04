import { useState } from 'react';
import { useAutomations } from '../../hooks/useAutomations';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AutomationRuleForm } from './AutomationRuleForm';
import { AutomationRuleList } from './AutomationRuleList';
import toast from 'react-hot-toast';

export function AutomationPage() {
  const { rules, loading, error, addRule, toggleRule } = useAutomations();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await addRule(data);
      setIsFormOpen(false);
      toast.success('Automation rule created successfully');
    } catch (error) {
      toast.error('Failed to create automation rule');
    }
  };

  const handleToggle = async (ruleId: string, isActive: boolean) => {
    try {
      await toggleRule(ruleId, isActive);
      toast.success(`Rule ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update rule status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="max-w-[1440px] mx-auto animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold">
            Automation Rules
          </h1>
          <Button onClick={() => setIsFormOpen(true)}>
            Create New Rule
          </Button>
        </div>

        <div className="p-4">
          {isFormOpen ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Create Automation Rule</h2>
              </CardHeader>
              <CardContent>
                <AutomationRuleForm
                  onSubmit={handleSubmit}
                  onCancel={() => setIsFormOpen(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <AutomationRuleList rules={rules} onToggle={handleToggle} />
          )}
        </div>
      </div>
    </main>
  );
}