import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code, Cpu, BrainCircuit, Server, Network } from 'lucide-react';
import { ArchitectureDiagram } from './ArchitectureDiagram';
interface ApiInfoSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const TechBadge = ({ children }: { children: React.ReactNode }) => (
  <Badge variant="secondary" className="text-sm font-medium py-1 px-2">{children}</Badge>
);
const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
      {icon}
      {title}
    </h3>
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);
export function ApiInfoSheet({ isOpen, setIsOpen }: ApiInfoSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-2xl font-sora flex items-center gap-3">
            <Code className="h-6 w-6 text-primary" />
            Technology & API Info
          </SheetTitle>
          <SheetDescription>
            An overview of the technologies powering LexiSlide.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          <Section icon={<Cpu className="h-5 w-5" />} title="Frontend">
            <TechBadge>React</TechBadge>
            <TechBadge>Vite</TechBadge>
            <TechBadge>TypeScript</TechBadge>
            <TechBadge>Tailwind CSS</TechBadge>
            <TechBadge>shadcn/ui</TechBadge>
            <TechBadge>Framer Motion</TechBadge>
            <TechBadge>Zustand</TechBadge>
          </Section>
          <Separator />
          <Section icon={<BrainCircuit className="h-5 w-5" />} title="Artificial Intelligence">
            <TechBadge>Google AI SDK</TechBadge>
            <TechBadge>Google Gemini Pro</TechBadge>
          </Section>
          <Separator />
          <Section icon={<Network className="h-5 w-5" />} title="Application Architecture">
            <ArchitectureDiagram />
          </Section>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Server className="h-5 w-5" />
              API Endpoint & Usage
            </h3>
            <div className="font-mono text-sm bg-secondary p-3 rounded-md break-all">
              <span className="font-bold text-teal-500">POST</span> generativelanguage.googleapis.com
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-secondary p-3 rounded-md">
                <p className="text-2xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">API Calls (Client-Side)</p>
              </div>
              <div className="bg-secondary p-3 rounded-md">
                <p className="text-2xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">Success Rate (Client-Side)</p>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="p-6 mt-auto bg-secondary/30">
          <p className="text-xs text-muted-foreground text-center w-full">
            All AI API calls are made directly from the client.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}