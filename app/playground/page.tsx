import AgentsLoader from "@/components/loaders/agents-loader";
import GeometricLoader from "@/components/loaders/geometric-loader";

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-xs mx-auto bg-zinc-900 p-4 rounded-lg">
        <AgentsLoader />
        <GeometricLoader />
      </div>
    </div>
  );
}
