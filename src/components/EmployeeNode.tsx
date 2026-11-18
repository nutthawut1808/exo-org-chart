import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Building2, ChevronDown, ChevronRight, User } from 'lucide-react';

interface EmployeeNodeData {
  id: string;
  name: string;
  job_title: string;
  department: string;
  division: string;
  photo_url: string | null;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onSelectEmployee: (id: string) => void;
}

export default memo(({ data }: { data: EmployeeNodeData }) => {
  return (
    <div
      onClick={() => data.onSelectEmployee(data.id)}
      className="w-[280px] bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl p-4 shadow-xl text-white cursor-pointer transition-all hover:shadow-blue-500/10 group relative"
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex items-start gap-3">
        {data.photo_url ? (
          <img
            src={data.photo_url}
            alt={data.name}
            className="w-12 h-12 rounded-xl object-cover bg-slate-700 border border-slate-600 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {data.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
            {data.name}
          </h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">{data.job_title}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="bg-slate-700/50 px-2 py-0.5 rounded-md truncate max-w-[160px]">
          {data.department}
        </span>
        <span className="text-blue-400 font-medium truncate max-w-[100px]">
          {data.division}
        </span>
      </div>

      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand(data.id);
          }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 hover:bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center border border-slate-600 shadow-md transition-colors z-10"
          title={data.isExpanded ? "Collapse Team" : "Expand Team"}
        >
          {data.isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});