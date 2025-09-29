"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  ClipboardList,
  Building2,
  CreditCard,
  School2,
  UsersRound,
  Download,
  FileDown,
  Lock,
  BookOpen,
  Bus,
} from "lucide-react";

/** ---------------- RBAC CONFIG ---------------- */
const ROLES = [
  "Admin",
  "Clerk",
  "Accounts",
  "Warden",
  "ExamCell",
  "Librarian",
  "Transport",
  "Viewer",
] as const;
type Role = (typeof ROLES)[number];

type TabKey =
  | "admissions"
  | "fees"
  | "hostel"
  | "exams"
  | "library"
  | "transport"
  | "dashboard";

const PERMISSIONS: Record<TabKey, { view: Role[]; edit: Role[] }> = {
  admissions: { view: ["Admin", "Clerk"], edit: ["Admin", "Clerk"] },
  fees: { view: ["Admin", "Accounts"], edit: ["Admin", "Accounts"] },
  hostel: { view: ["Admin", "Warden"], edit: ["Admin", "Warden"] },
  exams: { view: ["Admin", "ExamCell"], edit: ["Admin", "ExamCell"] },
  library: { view: ["Admin", "Librarian"], edit: ["Admin", "Librarian"] },
  transport: { view: ["Admin", "Transport"], edit: ["Admin", "Transport"] },
  dashboard: {
    view: [
      "Admin",
      "Clerk",
      "Accounts",
      "Warden",
      "ExamCell",
      "Librarian",
      "Transport",
      "Viewer",
    ],
    edit: ["Admin"],
  },
};

function canView(tab: TabKey, role: Role) {
  return PERMISSIONS[tab].view.includes(role);
}
function canEdit(tab: TabKey, role: Role) {
  return PERMISSIONS[tab].edit.includes(role);
}
/** ------------------------------------------------ */

type Student = {
  id: string;
  name: string;
  program: string;
  year: string;
  phone: string;
  email: string;
  totalFee: number;
  totalPaid: number;
  hostel: string;
  cgpa: number;
  backlogs: number;
  transport?: {
    route: string;
    stop: string;
    busNo: string;
    validTill: string;
  } | null;
};

type LibraryTxn = {
  id: string; // TXN id
  studentId: string;
  bookId: string;
  action: "BORROW" | "RETURN";
  date: string;
};

type TransportPass = {
  id: string;
  studentId: string;
  route: string;
  stop: string;
  busNo: string;
  validTill: string;
  issuedOn: string;
};

export default function Page() {
  // Role persistence
  const [role, setRole] = useState<Role>("Viewer");
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("demo_role")) as Role | null;
    if (saved && ROLES.includes(saved)) setRole(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("demo_role", role);
  }, [role]);

  // --- Master Student DB (very small in-memory demo) ---
  const [students, setStudents] = useState<Student[]>([
    {
      id: "STU001",
      name: "Anita Sharma",
      program: "B.Sc.",
      year: "1",
      phone: "9876543210",
      email: "anita@example.com",
      totalFee: 20000,
      totalPaid: 8000,
      hostel: "-",
      cgpa: 0,
      backlogs: 0,
      transport: null,
    },
    {
      id: "STU002",
      name: "Ravi Verma",
      program: "B.A.",
      year: "2",
      phone: "9898989898",
      email: "ravi@example.com",
      totalFee: 18000,
      totalPaid: 18000,
      hostel: "A/101/2",
      cgpa: 7.8,
      backlogs: 1,
      transport: {
        route: "R1",
        stop: "Central Gate",
        busNo: "RJ-14-1234",
        validTill: "2026-03-31",
      },
    },
  ]);

  // Forms
  const [admissionsForm, setAdmissionsForm] = useState({
    name: "",
    program: "B.Sc.",
    year: "1",
    phone: "",
    email: "",
  });
  const [feeForm, setFeeForm] = useState({
    id: "",
    amount: "",
    term: "Sem 1",
    mode: "UPI",
  });
  const [hostelForm, setHostelForm] = useState({
    id: "",
    hostel: "A",
    room: "101",
    bed: "1",
  });
  const [marksForm, setMarksForm] = useState({
    id: "",
    sem: "1",
    subject: "English",
    marks: "",
  });
  const [receipt, setReceipt] = useState<null | {
    id: string;
    name: string;
    amount: number;
    term: string;
    receiptNo: string;
    date: string;
  }>(null);

  // Library state
  const [libForm, setLibForm] = useState({
    studentId: "",
    bookId: "",
    action: "BORROW" as "BORROW" | "RETURN",
  });
  const [libTxns, setLibTxns] = useState<LibraryTxn[]>([
    {
      id: "LTX-001",
      studentId: "STU002",
      bookId: "BK1001",
      action: "BORROW",
      date: new Date().toLocaleString(),
    },
  ]);

  // Transport state
  const [tpForm, setTpForm] = useState({
    studentId: "",
    route: "R1",
    stop: "Main Gate",
    busNo: "RJ-14-2025",
    validTill: "2026-03-31",
  });
  const [passes, setPasses] = useState<TransportPass[]>([
    {
      id: "PASS-001",
      studentId: "STU002",
      route: "R1",
      stop: "Central Gate",
      busNo: "RJ-14-1234",
      validTill: "2026-03-31",
      issuedOn: new Date().toLocaleDateString(),
    },
  ]);

  // Derived totals
  const totals = useMemo(() => {
    const totalStudents = students.length;
    const feesCollected = students.reduce((s, st) => s + st.totalPaid, 0);
    const dues = students.reduce(
      (s, st) => s + Math.max(0, st.totalFee - st.totalPaid),
      0
    );
    const hostelOccupied = students.filter(
      (s) => s.hostel !== "-" && s.hostel.trim() !== ""
    ).length;
    const hostelFree = 40 - hostelOccupied; // assume 40 beds
    const passRate = Math.round(
      (students.filter((s) => s.backlogs === 0).length / totalStudents) * 100
    );

    // Books currently out (BORROW without matching RETURN)
    const openBorrows = new Map<string, number>(); // key: studentId|bookId -> count
    libTxns.forEach((t) => {
      const k = `${t.studentId}|${t.bookId}`;
      const prev = openBorrows.get(k) || 0;
      openBorrows.set(k, prev + (t.action === "BORROW" ? 1 : -1));
    });
    const booksOut = Array.from(openBorrows.values()).reduce(
      (acc, v) => acc + (v > 0 ? v : 0),
      0
    );

    const activePasses = passes.filter(
      (p) => new Date(p.validTill) >= new Date()
    ).length;

    return {
      totalStudents,
      feesCollected,
      dues,
      hostelOccupied,
      hostelFree,
      passRate,
      booksOut,
      activePasses,
    };
  }, [students, libTxns, passes]);

  const chartData = useMemo(
    () => [
      { name: "Students", value: totals.totalStudents },
      { name: "Fees Collected", value: totals.feesCollected },
      { name: "Dues", value: totals.dues },
      { name: "Hostel Filled", value: totals.hostelOccupied },
      { name: "Books Out", value: totals.booksOut },
      { name: "Active Passes", value: totals.activePasses },
    ],
    [totals]
  );

  // Utility: generate new Student ID
  const nextId = () => `STU${String(students.length + 1).padStart(3, "0")}`;
  const newTxnId = (pfx: string) =>
    `${pfx}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // --- Actions (guarded by canEdit) ---
  const addAdmission = () => {
    if (!canEdit("admissions", role)) return;
    if (!admissionsForm.name.trim()) return;
    const id = nextId();
    setStudents((prev) => [
      ...prev,
      {
        id,
        name: admissionsForm.name.trim(),
        program: admissionsForm.program,
        year: admissionsForm.year,
        phone: admissionsForm.phone,
        email: admissionsForm.email,
        totalFee: 20000,
        totalPaid: 0,
        hostel: "-",
        cgpa: 0,
        backlogs: 0,
        transport: null,
      },
    ]);
    setAdmissionsForm({
      name: "",
      program: "B.Sc.",
      year: "1",
      phone: "",
      email: "",
    });
  };

  const payFees = () => {
    if (!canEdit("fees", role)) return;
    const st = students.find((s) => s.id === feeForm.id.trim());
    if (!st) return alert("Student not found");
    const amt = Number(feeForm.amount || 0);
    if (!amt || amt <= 0) return alert("Enter a valid amount");
    setStudents((prev) =>
      prev.map((s) =>
        s.id === st.id ? { ...s, totalPaid: s.totalPaid + amt } : s
      )
    );
    const receiptNo = newTxnId("RCT");
    setReceipt({
      id: st.id,
      name: st.name,
      amount: amt,
      term: feeForm.term,
      receiptNo,
      date: new Date().toLocaleString(),
    });
    setFeeForm({ id: "", amount: "", term: "Sem 1", mode: "UPI" });
  };

  const allocateHostel = () => {
    if (!canEdit("hostel", role)) return;
    const st = students.find((s) => s.id === hostelForm.id.trim());
    if (!st) return alert("Student not found");
    const slot = `${hostelForm.hostel}/${hostelForm.room}/${hostelForm.bed}`;
    setStudents((prev) =>
      prev.map((s) => (s.id === st.id ? { ...s, hostel: slot } : s))
    );
    setHostelForm({ id: "", hostel: "A", room: "101", bed: "1" });
  };

  const uploadMarks = () => {
    if (!canEdit("exams", role)) return;
    const st = students.find((s) => s.id === marksForm.id.trim());
    if (!st) return alert("Student not found");
    const marks = Math.max(0, Math.min(100, Number(marksForm.marks || 0)));
    const pass = marks >= 40;
    const newCGPA =
      Math.round((((st.cgpa || 0) * 1 + marks / 10) / 2) * 10) / 10;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === st.id
          ? {
              ...s,
              cgpa: newCGPA,
              backlogs: pass ? s.backlogs : s.backlogs + 1,
            }
          : s
      )
    );
    setMarksForm({ id: "", sem: "1", subject: "English", marks: "" });
  };

  const submitLibrary = () => {
    if (!canEdit("library", role)) return;
    const { studentId, bookId, action } = libForm;
    if (!studentId.trim() || !bookId.trim())
      return alert("Enter Student ID and Book ID");
    const st = students.find((s) => s.id === studentId.trim());
    if (!st) return alert("Student not found");

    // Basic open-loan logic
    if (action === "RETURN") {
      // check there is an open borrow
      const count = libTxns.reduce(
        (c, t) =>
          c +
          (t.studentId === studentId && t.bookId === bookId
            ? t.action === "BORROW"
              ? 1
              : -1
            : 0),
        0
      );
      if (count <= 0) return alert("No open borrow found for this book");
    }

    setLibTxns((prev) => [
      ...prev,
      {
        id: newTxnId("LTX"),
        studentId,
        bookId,
        action,
        date: new Date().toLocaleString(),
      },
    ]);
    setLibForm({ studentId: "", bookId: "", action: "BORROW" });
  };

  const issuePass = () => {
    if (!canEdit("transport", role)) return;
    const { studentId, route, stop, busNo, validTill } = tpForm;
    if (!studentId.trim()) return alert("Enter Student ID");
    const st = students.find((s) => s.id === studentId.trim());
    if (!st) return alert("Student not found");
    const pass: TransportPass = {
      id: newTxnId("PASS"),
      studentId,
      route,
      stop,
      busNo,
      validTill,
      issuedOn: new Date().toLocaleDateString(),
    };
    setPasses((prev) => [pass, ...prev]);
    // reflect on student
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, transport: { route, stop, busNo, validTill } }
          : s
      )
    );
    setTpForm({
      studentId: "",
      route: "R1",
      stop: "Main Gate",
      busNo: "RJ-14-2025",
      validTill: "2026-03-31",
    });
  };

  // Which tabs are visible & default tab
  const allTabs: TabKey[] = [
    "admissions",
    "fees",
    "hostel",
    "exams",
    "library",
    "transport",
    "dashboard",
  ];
  const visibleTabs: TabKey[] = allTabs.filter((t) => canView(t, role));
  const [tab, setTab] = useState<TabKey>("dashboard");
  useEffect(() => {
    setTab(
      visibleTabs.includes(tab) ? tab : visibleTabs[0] || "dashboard"
    ); /* eslint-disable-next-line */
  }, [role]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 p-6'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
             Niyamika- A Unified Campus Governance Platform
            </h1>
            <p className='text-sm text-slate-600'>
              Admissions • Fees • Hostel • Exams • Library • Transport •
              Dashboard
            </p>
          </div>
          {/* Role Switcher */}
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='rounded-full px-3 py-1'>
              Role
            </Badge>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7'>
          <KPI
            icon={UsersRound}
            label='Students'
            value={totals.totalStudents}
          />
          <KPI
            icon={CreditCard}
            label='Fees Collected'
            value={`₹${totals.feesCollected.toLocaleString()}`}
          />
          <KPI
            icon={ClipboardList}
            label='Dues'
            value={`₹${totals.dues.toLocaleString()}`}
          />
          <KPI
            icon={Building2}
            label='Hostel Filled'
            value={totals.hostelOccupied}
          />
          <KPI icon={School2} label='Pass %' value={`${totals.passRate}%`} />
          <KPI icon={BookOpen} label='Books Out' value={totals.booksOut} />
          <KPI icon={Bus} label='Active Passes' value={totals.activePasses} />
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className='space-y-4'
        >
          <TabsList className='flex w-full flex-wrap gap-2'>
            {visibleTabs.map((t) => (
              <TabsTrigger key={t} value={t}>
                {labelForTab(t)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Admissions */}
          {canView("admissions", role) && (
            <TabsContent value='admissions' className='space-y-4'>
              {!canEdit("admissions", role) && <ReadOnlyBanner />}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card className='lg:col-span-1'>
                  <CardHeader>
                    <CardTitle>New Admission</CardTitle>
                    <CardDescription>Form → Master DB</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={admissionsForm.name}
                        onChange={(e) =>
                          setAdmissionsForm((s) => ({
                            ...s,
                            name: e.target.value,
                          }))
                        }
                        placeholder='Student full name'
                        disabled={!canEdit("admissions", role)}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label>Program</Label>
                        <Select
                          value={admissionsForm.program}
                          onValueChange={(v) =>
                            setAdmissionsForm((s) => ({ ...s, program: v }))
                          }
                          disabled={!canEdit("admissions", role)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Program' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='B.Sc.'>B.Sc.</SelectItem>
                            <SelectItem value='B.A.'>B.A.</SelectItem>
                            <SelectItem value='B.Com.'>B.Com.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Year/Sem</Label>
                        <Select
                          value={admissionsForm.year}
                          onValueChange={(v) =>
                            setAdmissionsForm((s) => ({ ...s, year: v }))
                          }
                          disabled={!canEdit("admissions", role)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Year' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='2'>2</SelectItem>
                            <SelectItem value='3'>3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={admissionsForm.phone}
                          onChange={(e) =>
                            setAdmissionsForm((s) => ({
                              ...s,
                              phone: e.target.value,
                            }))
                          }
                          placeholder='10-digit'
                          disabled={!canEdit("admissions", role)}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={admissionsForm.email}
                          onChange={(e) =>
                            setAdmissionsForm((s) => ({
                              ...s,
                              email: e.target.value,
                            }))
                          }
                          placeholder='example@college.ac.in'
                          disabled={!canEdit("admissions", role)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={addAdmission}
                      className='w-full'
                      disabled={!canEdit("admissions", role)}
                    >
                      Add Student
                    </Button>
                  </CardContent>
                </Card>

                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Master Student Database</CardTitle>
                    <CardDescription>Single source of truth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Hostel</TableHead>
                          <TableHead>Total Fee</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Dues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.program}</TableCell>
                            <TableCell>{s.year}</TableCell>
                            <TableCell>{s.hostel}</TableCell>
                            <TableCell>
                              ₹{s.totalFee.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ₹{s.totalPaid.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ₹
                              {Math.max(
                                0,
                                s.totalFee - s.totalPaid
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Fees */}
          {canView("fees", role) && (
            <TabsContent value='fees' className='space-y-4'>
              {!canEdit("fees", role) && <ReadOnlyBanner />}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Collect Fees</CardTitle>
                    <CardDescription>Enter Student ID & amount</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Label>Student ID</Label>
                      <Input
                        value={feeForm.id}
                        onChange={(e) =>
                          setFeeForm((s) => ({ ...s, id: e.target.value }))
                        }
                        placeholder='e.g. STU001'
                        disabled={!canEdit("fees", role)}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type='number'
                          value={feeForm.amount}
                          onChange={(e) =>
                            setFeeForm((s) => ({
                              ...s,
                              amount: e.target.value,
                            }))
                          }
                          placeholder='₹'
                          disabled={!canEdit("fees", role)}
                        />
                      </div>
                      <div>
                        <Label>Term/Sem</Label>
                        <Select
                          value={feeForm.term}
                          onValueChange={(v) =>
                            setFeeForm((s) => ({ ...s, term: v }))
                          }
                          disabled={!canEdit("fees", role)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Term' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Sem 1'>Sem 1</SelectItem>
                            <SelectItem value='Sem 2'>Sem 2</SelectItem>
                            <SelectItem value='Sem 3'>Sem 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Mode</Label>
                      <Select
                        value={feeForm.mode}
                        onValueChange={(v) =>
                          setFeeForm((s) => ({ ...s, mode: v }))
                        }
                        disabled={!canEdit("fees", role)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Mode' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='UPI'>UPI</SelectItem>
                          <SelectItem value='Card'>Card</SelectItem>
                          <SelectItem value='Cash'>Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={payFees}
                          className='w-full'
                          disabled={!canEdit("fees", role)}
                        >
                          Process Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Receipt</DialogTitle>
                          <DialogDescription>
                            Payment confirmation
                          </DialogDescription>
                        </DialogHeader>
                        {receipt ? (
                          <div className='space-y-2 text-sm'>
                            <div className='flex items-center justify-between'>
                              <span>Receipt No.</span>
                              <span className='font-medium'>
                                {receipt.receiptNo}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span>Date</span>
                              <span>{receipt.date}</span>
                            </div>
                            <Separator />
                            <div className='flex items-center justify-between'>
                              <span>Student</span>
                              <span className='font-medium'>
                                {receipt.id} – {receipt.name}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span>Term</span>
                              <span>{receipt.term}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span>Amount</span>
                              <span className='font-semibold'>
                                ₹{receipt.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className='pt-2 text-right'>
                              <Button variant='outline' size='sm'>
                                <FileDown className='mr-2 h-4 w-4' /> Download
                                PDF
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className='text-sm text-slate-600'>
                            Fill details and click Process Payment to generate a
                            demo receipt.
                          </p>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Quick Lookup</CardTitle>
                    <CardDescription>Search dues & payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Dues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>
                              ₹{s.totalPaid.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ₹
                              {Math.max(
                                0,
                                s.totalFee - s.totalPaid
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Hostel */}
          {canView("hostel", role) && (
            <TabsContent value='hostel' className='space-y-4'>
              {!canEdit("hostel", role) && <ReadOnlyBanner />}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Allocate Bed</CardTitle>
                    <CardDescription>Capacity checks implied</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Label>Student ID</Label>
                      <Input
                        value={hostelForm.id}
                        onChange={(e) =>
                          setHostelForm((s) => ({ ...s, id: e.target.value }))
                        }
                        placeholder='e.g. STU002'
                        disabled={!canEdit("hostel", role)}
                      />
                    </div>
                    <div className='grid grid-cols-3 gap-3'>
                      <div>
                        <Label>Hostel</Label>
                        <Select
                          value={hostelForm.hostel}
                          onValueChange={(v) =>
                            setHostelForm((s) => ({ ...s, hostel: v }))
                          }
                          disabled={!canEdit("hostel", role)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='A' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='A'>A</SelectItem>
                            <SelectItem value='B'>B</SelectItem>
                            <SelectItem value='C'>C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Room</Label>
                        <Input
                          value={hostelForm.room}
                          onChange={(e) =>
                            setHostelForm((s) => ({
                              ...s,
                              room: e.target.value,
                            }))
                          }
                          placeholder='101'
                          disabled={!canEdit("hostel", role)}
                        />
                      </div>
                      <div>
                        <Label>Bed</Label>
                        <Input
                          value={hostelForm.bed}
                          onChange={(e) =>
                            setHostelForm((s) => ({
                              ...s,
                              bed: e.target.value,
                            }))
                          }
                          placeholder='1'
                          disabled={!canEdit("hostel", role)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={allocateHostel}
                      className='w-full'
                      disabled={!canEdit("hostel", role)}
                    >
                      Allocate
                    </Button>
                  </CardContent>
                </Card>

                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Occupancy Snapshot</CardTitle>
                    <CardDescription>Live hostel availability</CardDescription>
                  </CardHeader>
                  <CardContent className='grid grid-cols-2 gap-3'>
                    <Metric label='Total Beds' value={40} />
                    <Metric label='Occupied' value={totals.hostelOccupied} />
                    <Metric label='Free' value={totals.hostelFree} />
                    <Metric
                      label='Utilization'
                      value={`${Math.round(
                        (totals.hostelOccupied / 40) * 100
                      )}%`}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Exams */}
          {canView("exams", role) && (
            <TabsContent value='exams' className='space-y-4'>
              {!canEdit("exams", role) && <ReadOnlyBanner />}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Marks (demo)</CardTitle>
                    <CardDescription>
                      Single subject / quick calc
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Label>Student ID</Label>
                      <Input
                        value={marksForm.id}
                        onChange={(e) =>
                          setMarksForm((s) => ({ ...s, id: e.target.value }))
                        }
                        placeholder='e.g. STU001'
                        disabled={!canEdit("exams", role)}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label>Semester</Label>
                        <Select
                          value={marksForm.sem}
                          onValueChange={(v) =>
                            setMarksForm((s) => ({ ...s, sem: v }))
                          }
                          disabled={!canEdit("exams", role)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='1' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='2'>2</SelectItem>
                            <SelectItem value='3'>3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <Select
                          value={marksForm.subject}
                          onValueChange={(v) =>
                            setMarksForm((s) => ({ ...s, subject: v }))
                          }
                          disabled={!canEdit("exams", role)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='English' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='English'>English</SelectItem>
                            <SelectItem value='Maths'>Maths</SelectItem>
                            <SelectItem value='Economics'>Economics</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Marks (0-100)</Label>
                      <Input
                        type='number'
                        value={marksForm.marks}
                        onChange={(e) =>
                          setMarksForm((s) => ({ ...s, marks: e.target.value }))
                        }
                        placeholder='e.g. 76'
                        disabled={!canEdit("exams", role)}
                      />
                    </div>
                    <Button
                      onClick={uploadMarks}
                      className='w-full'
                      disabled={!canEdit("exams", role)}
                    >
                      Save Marks
                    </Button>
                  </CardContent>
                </Card>

                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Results Snapshot</CardTitle>
                    <CardDescription>CGPA & backlogs overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>CGPA</TableHead>
                          <TableHead>Backlogs</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.cgpa}</TableCell>
                            <TableCell>{s.backlogs}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Library */}
          {canView("library", role) && (
            <TabsContent value='library' className='space-y-4'>
              {!canEdit("library", role) && <ReadOnlyBanner />}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Borrow / Return</CardTitle>
                    <CardDescription>Scan/enter IDs</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Label>Student ID</Label>
                      <Input
                        value={libForm.studentId}
                        onChange={(e) =>
                          setLibForm((s) => ({
                            ...s,
                            studentId: e.target.value,
                          }))
                        }
                        placeholder='e.g. STU001'
                        disabled={!canEdit("library", role)}
                      />
                    </div>
                    <div>
                      <Label>Book ID</Label>
                      <Input
                        value={libForm.bookId}
                        onChange={(e) =>
                          setLibForm((s) => ({ ...s, bookId: e.target.value }))
                        }
                        placeholder='e.g. BK1023'
                        disabled={!canEdit("library", role)}
                      />
                    </div>
                    <div>
                      <Label>Action</Label>
                      <Select
                        value={libForm.action}
                        onValueChange={(v) =>
                          setLibForm((s) => ({
                            ...s,
                            action: v as "BORROW" | "RETURN",
                          }))
                        }
                        disabled={!canEdit("library", role)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='BORROW'>BORROW</SelectItem>
                          <SelectItem value='RETURN'>RETURN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={submitLibrary}
                      className='w-full'
                      disabled={!canEdit("library", role)}
                    >
                      Submit
                    </Button>
                  </CardContent>
                </Card>

                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Borrow/Return logs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Txn</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Book</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...libTxns]
                          .reverse()
                          .slice(0, 10)
                          .map((t) => (
                            <TableRow key={t.id}>
                              <TableCell>{t.id}</TableCell>
                              <TableCell>{t.date}</TableCell>
                              <TableCell>{t.studentId}</TableCell>
                              <TableCell>{t.bookId}</TableCell>
                              <TableCell>{t.action}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Transport */}
          {canView("transport", role) && (
            <TabsContent value='transport' className='space-y-4'>
              {!canEdit("transport", role) && <ReadOnlyBanner />}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Issue / Renew Bus Pass</CardTitle>
                    <CardDescription>Assign route & validity</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <Label>Student ID</Label>
                      <Input
                        value={tpForm.studentId}
                        onChange={(e) =>
                          setTpForm((s) => ({
                            ...s,
                            studentId: e.target.value,
                          }))
                        }
                        placeholder='e.g. STU001'
                        disabled={!canEdit("transport", role)}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label>Route</Label>
                        <Select
                          value={tpForm.route}
                          onValueChange={(v) =>
                            setTpForm((s) => ({ ...s, route: v }))
                          }
                          disabled={!canEdit("transport", role)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='R1'>R1</SelectItem>
                            <SelectItem value='R2'>R2</SelectItem>
                            <SelectItem value='R3'>R3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Stop</Label>
                        <Input
                          value={tpForm.stop}
                          onChange={(e) =>
                            setTpForm((s) => ({ ...s, stop: e.target.value }))
                          }
                          placeholder='Main Gate'
                          disabled={!canEdit("transport", role)}
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label>Bus No.</Label>
                        <Input
                          value={tpForm.busNo}
                          onChange={(e) =>
                            setTpForm((s) => ({ ...s, busNo: e.target.value }))
                          }
                          placeholder='RJ-14-2025'
                          disabled={!canEdit("transport", role)}
                        />
                      </div>
                      <div>
                        <Label>Valid Till</Label>
                        <Input
                          type='date'
                          value={tpForm.validTill}
                          onChange={(e) =>
                            setTpForm((s) => ({
                              ...s,
                              validTill: e.target.value,
                            }))
                          }
                          disabled={!canEdit("transport", role)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={issuePass}
                      className='w-full'
                      disabled={!canEdit("transport", role)}
                    >
                      Issue Pass
                    </Button>
                  </CardContent>
                </Card>

                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Active/Recent Passes</CardTitle>
                    <CardDescription>Latest 10 entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pass</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Stop</TableHead>
                          <TableHead>Bus</TableHead>
                          <TableHead>Valid Till</TableHead>
                          <TableHead>Issued On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {passes.slice(0, 10).map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.studentId}</TableCell>
                            <TableCell>{p.route}</TableCell>
                            <TableCell>{p.stop}</TableCell>
                            <TableCell>{p.busNo}</TableCell>
                            <TableCell>{p.validTill}</TableCell>
                            <TableCell>{p.issuedOn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Dashboard */}
          {canView("dashboard", role) && (
            <TabsContent value='dashboard' className='space-y-4'>
              {!canEdit("dashboard", role) && <ReadOnlyBanner subtle />}
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Dashboard</CardTitle>
                  <CardDescription>
                    Live metrics from single source of truth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80 w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='value' fill='currentColor' />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <footer className='mt-8 flex items-center justify-between text-xs text-slate-500'>
          <span>
            Smart India Hackathon 2025 • Rajasthan Govt. Problem Statement •
            RBAC Demo (incl. Library & Transport)
          </span>
          <div className='flex items-center gap-2'>
            <Download className='h-3.5 w-3.5' />
            <span>Switch roles to demo access control</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Small helpers/components ---------- */
function labelForTab(t: TabKey) {
  switch (t) {
    case "admissions":
      return "Admissions";
    case "fees":
      return "Fees";
    case "hostel":
      return "Hostel";
    case "exams":
      return "Exams";
    case "library":
      return "Library";
    case "transport":
      return "Transport";
    case "dashboard":
      return "Dashboard";
  }
}

function KPI({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className='border-slate-200'>
      <CardHeader className='pb-2'>
        <div className='flex items-center gap-2 text-slate-600'>
          <Icon className='h-4 w-4' /> <span className='text-xs'>{label}</span>
        </div>
        <CardTitle className='text-xl'>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='rounded-2xl border bg-white p-4 shadow-sm'>
      <div className='text-xs text-slate-500'>{label}</div>
      <div className='text-2xl font-semibold'>{value}</div>
    </div>
  );
}

function ReadOnlyBanner({ subtle = false }: { subtle?: boolean }) {
  return (
    <div
      className={`mb-2 flex items-center gap-2 rounded-lg border ${
        subtle ? "border-slate-200 bg-slate-50" : "border-amber-300 bg-amber-50"
      } px-3 py-2 text-xs text-slate-700`}
    >
      <Lock className='h-3.5 w-3.5' />
      <span>
        This section is <strong>read-only</strong> for your current role.
      </span>
    </div>
  );
}
