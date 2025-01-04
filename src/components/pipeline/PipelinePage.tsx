import { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { usePipeline } from '../../hooks/usePipeline';
import { Card } from '../ui/Card';
import { PipelineColumn } from './PipelineColumn';
import { DealForm } from './DealForm';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

const stages = ['prospect', 'qualified', 'negotiation', 'won', 'lost'];

export function PipelinePage() {
  const { deals, loading, error, updateDealStage } = usePipeline();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = stages[destination.droppableId];

    try {
      await updateDealStage(draggableId, newStage);
      toast.success('Deal moved successfully');
    } catch (error) {
      toast.error('Failed to move deal');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(deal => deal.stage === stage);
    return acc;
  }, {});

  return (
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="max-w-[1440px] mx-auto animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold">
            Pipeline
          </h1>
          <Button onClick={() => setIsFormOpen(true)}>
            Add Deal
          </Button>
        </div>

        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-5 gap-4">
              {stages.map((stage, index) => (
                <Droppable key={stage} droppableId={String(index)}>
                  {(provided) => (
                    <PipelineColumn
                      stage={stage}
                      deals={dealsByStage[stage]}
                      provided={provided}
                    />
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {isFormOpen && (
        <DealForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={async (data) => {
            try {
              // Handle deal creation
              setIsFormOpen(false);
              toast.success('Deal created successfully');
            } catch (error) {
              toast.error('Failed to create deal');
            }
          }}
        />
      )}
    </main>
  );
}