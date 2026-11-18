"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Navbar from "@/components/Navbar";
import EmployeeNode from "@/components/EmployeeNode";
import { Employee, EmployeeDetail } from "@/types/employee";
import { getLayoutedElements } from "@/lib/tree-layout";
import {
  Search,
  Filter,
  RotateCcw,
  X,
  Mail,
  MapPin,
  Users,
  UserCheck,
  Building,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const ORG_STRUCTURE: Record<string, string[]> = {
  "Executive Office": ["Executive Management"],
  Technology: ["Software Development", "IT Infrastructure"],
  Commercial: ["Sales", "Marketing", "Travel Services"],
  Operations: ["Product"],
  "Corporate Services": ["Finance", "Human Resources"],
  "Customer Experience": ["Customer Service", "Guest Relations"],
};

function OrgChartContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedDiv, setSelectedDiv] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Expanded State (เริ่มต้นให้ Top Executive เปิดอยู่คนเดียว)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["EMP0001"])
  );

  // Employee Detail Modal/Panel
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const { fitView } = useReactFlow();
  
  // ใช้ React Flow State พร้อมกำหนด Type <Node[]> และ <Edge[]> ให้ถูกต้อง
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const nodeTypes = useMemo(() => ({ employeeNode: EmployeeNode }), []);

  // 1. โหลดข้อมูลพนักงานทั้งหมด
  useEffect(() => {
    fetch("/api/employees")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      })
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. อัปเดต Nodes & Edges เมื่อข้อมูลหรือการ Expand เปลี่ยนแปลง
  const updateChart = useCallback(() => {
    if (employees.length === 0) return;

    let filtered = employees;
    if (selectedDept) {
      filtered = filtered.filter((e) => e.department === selectedDept);
    }
    if (selectedDiv) {
      filtered = filtered.filter((e) => e.division === selectedDiv);
    }

    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(
      employees,
      expandedIds
    );

    const finalNodes = layoutNodes.map((node) => {
      const empData = node.data as any;
      const isMatch =
        (!selectedDept || empData.department === selectedDept) &&
        (!selectedDiv || empData.division === selectedDiv);

      return {
        ...node,
        data: {
          ...empData,
          onToggleExpand: handleToggleExpand,
          onSelectEmployee: handleSelectEmployee,
        },
        style: {
          opacity: isMatch ? 1 : 0.4,
        },
      };
    });

    setNodes(finalNodes);
    setEdges(layoutEdges);
  }, [employees, expandedIds, selectedDept, selectedDiv, setNodes, setEdges]);

  useEffect(() => {
    updateChart();
  }, [updateChart]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const matches = employees
      .filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.job_title.toLowerCase().includes(query)
      )
      .slice(0, 10);

    setSearchResults(matches);
  }, [searchQuery, employees]);

  const handleSelectEmployee = async (id: string) => {
    setSelectedEmployeeId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (res.status === 404) {
        setEmployeeDetail(null);
        return;
      }
      const data = await res.json();
      setEmployeeDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResetView = () => {
    setSelectedDept("");
    setSelectedDiv("");
    setSearchQuery("");
    setExpandedIds(new Set(["EMP0001"]));
    setSelectedEmployeeId(null);
    setEmployeeDetail(null);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
  };

  const availableDivisions = selectedDept ? ORG_STRUCTURE[selectedDept] || [] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading Organization Chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-4">
        <div className="bg-slate-900 border border-red-500/30 p-6 rounded-2xl max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Failed to load data</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10 shadow-md">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[260px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-50 divide-y divide-slate-700/60">
                {searchResults.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      handleSelectEmployee(emp.id);
                      setSearchQuery("");
                      setIsSearching(false);
                    }}
                    className="p-3 hover:bg-slate-700/50 cursor-pointer transition-colors text-left"
                  >
                    <p className="font-semibold text-xs text-white">{emp.name}</p>
                    <p className="text-[11px] text-slate-400">{emp.job_title}</p>
                    <div className="flex gap-2 mt-1 text-[10px] text-blue-400">
                      <span>{emp.department}</span> • <span>{emp.division}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedDiv("");
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {Object.keys(ORG_STRUCTURE).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedDiv}
            onChange={(e) => setSelectedDiv(e.target.value)}
            disabled={!selectedDept}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Divisions</option>
            {availableDivisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>

          {(selectedDept || selectedDiv || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDept("");
                setSelectedDiv("");
                setSearchQuery("");
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <button
          onClick={handleResetView}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-xl border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset View
        </button>
      </div>

      <div className="flex-1 relative w-full h-[calc(100vh-130px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#1e293b" gap={16} />
          <Controls className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl fill-white" />
        </ReactFlow>
      </div>

      {selectedEmployeeId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-white">Employee Details</h2>
            <button
              onClick={() => setSelectedEmployeeId(null)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {loadingDetail ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : employeeDetail ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {employeeDetail.photo_url ? (
                    <img
                      src={employeeDetail.photo_url}
                      alt={employeeDetail.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-slate-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
                      {employeeDetail.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {employeeDetail.name}
                    </h3>
                    <p className="text-xs text-blue-400 font-medium">
                      {employeeDetail.job_title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ID: {employeeDetail.id}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Department & Division</p>
                      <p className="font-medium text-white">
                        {employeeDetail.department} / {employeeDetail.division}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Country</p>
                      <p className="font-medium text-white">{employeeDetail.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Email Address</p>
                      <p className="font-medium text-white">{employeeDetail.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Manager</p>
                      <p className="font-medium text-white">
                        {employeeDetail.manager_name || (
                          <span className="text-blue-400">Top Executive (No Manager)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Direct Reports</p>
                      <p className="font-medium text-white">
                        {employeeDetail.direct_report_count} employee(s)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Employee not found (404)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <ReactFlowProvider>
      <OrgChartContent />
    </ReactFlowProvider>
  );
}