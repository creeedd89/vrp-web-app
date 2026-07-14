import TopBar from '@/shared/components/TopBar';
import ScenarioAnalyzerView from '@/features/scenario-analyzer/ScenarioAnalyzerView';

export default function ScenarioAnalysisPage() {
  return (
    <div className="flex flex-col h-full z-10 relative">
      <TopBar title="Scenario Analysis" />
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <ScenarioAnalyzerView />
      </div>
    </div>
  );
}
