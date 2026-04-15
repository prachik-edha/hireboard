"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { IJob, JobStatus } from "@/models/Job";
import ScoreRing from "./ScoreRing";

const COLUMNS: { id: JobStatus; label: string; color: string }[] = [
  { id: "wishlist", label: "Wishlist", color: "var(--text3)" },
  { id: "applied", label: "Applied", color: "var(--blue)" },
  { id: "interview", label: "Interview", color: "var(--amber)" },
  { id: "offer", label: "Offer", color: "var(--green)" },
  { id: "rejected", label: "Rejected", color: "var(--red)" },
];

function JobCard({ job, onClick }: { job: IJob; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job._id as string });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={onClick}
        style={{
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "12px",
          cursor: "pointer",
          marginBottom: "8px",
          transition: "border-color 0.15s",
        }}
        whileHover={{ borderColor: "var(--border2)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 500, fontSize: "13px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.role}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text2)" }}>{job.company}</p>
          </div>
          {job.matchScore != null && (
            <ScoreRing score={job.matchScore} size={40} />
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
          {job.location && (
            <span style={{ fontSize: "11px", color: "var(--text3)" }}>📍 {job.location}</span>
          )}
          {job.salary?.min && (
            <span style={{ fontSize: "11px", color: "var(--text3)" }}>
              💰 ${(job.salary.min / 1000).toFixed(0)}k–${(job.salary.max! / 1000).toFixed(0)}k
            </span>
          )}
        </div>

        {job.nextAction && (
          <div style={{
            marginTop: "8px", fontSize: "11px",
            background: "var(--accent-glow)", color: "var(--accent2)",
            padding: "4px 8px", borderRadius: "6px",
          }}>
            ↻ {job.nextAction}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Column({
  col,
  jobs,
  onCardClick,
}: {
  col: (typeof COLUMNS)[0];
  jobs: IJob[];
  onCardClick: (job: IJob) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div style={{
      flex: "0 0 220px",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "12px", padding: "0 2px",
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {col.label}
        </span>
        <span style={{
          marginLeft: "auto", fontSize: "11px", fontWeight: 500,
          background: "var(--bg4)", color: "var(--text3)",
          padding: "1px 7px", borderRadius: "99px",
          border: "1px solid var(--border)",
        }}>
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: "120px",
          background: isOver ? "rgba(124,106,247,0.04)" : "transparent",
          borderRadius: "var(--radius)",
          border: isOver ? "1px dashed rgba(124,106,247,0.3)" : "1px dashed transparent",
          transition: "all 0.15s",
          padding: "4px",
        }}
      >
        <SortableContext
          items={jobs.map(j => j._id as string)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {jobs.map(job => (
              <JobCard
                key={job._id as string}
                job={job}
                onClick={() => onCardClick(job)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {jobs.length === 0 && (
          <div style={{
            textAlign: "center", padding: "24px 8px",
            color: "var(--text3)", fontSize: "12px",
          }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  jobs: IJob[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => Promise<void>;
  onCardClick: (job: IJob) => void;
}

export default function KanbanBoard({ jobs, onStatusChange, onCardClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const activeJob = jobs.find(j => (j._id as string) === activeId);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const overId = over.id as string;
    const newStatus = COLUMNS.find(c => c.id === overId)?.id;
    const job = jobs.find(j => (j._id as string) === active.id);
    if (!job || !newStatus || job.status === newStatus) return;

    await onStatusChange(active.id as string, newStatus);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px" }}>
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            col={col}
            jobs={jobs.filter(j => j.status === col.id)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeJob && (
          <div style={{
            background: "var(--bg3)", border: "1px solid var(--accent)",
            borderRadius: "var(--radius)", padding: "12px",
            boxShadow: "0 8px 32px rgba(124,106,247,0.2)",
            opacity: 0.95, width: "220px",
          }}>
            <p style={{ fontWeight: 500, fontSize: "13px" }}>{activeJob.role}</p>
            <p style={{ fontSize: "12px", color: "var(--text2)" }}>{activeJob.company}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
