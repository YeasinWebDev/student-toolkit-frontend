import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    priority: "Medium",
    deadline: "",
    day: "All",
    time: "",
    notes: "",
  });

  const [viewDay, setViewDay] = useState("All");

  const getData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/planner?day=${viewDay}`, { withCredentials: true });
      setTasks(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, [viewDay]);

  function resetForm() {
    setForm({ subject: "", topic: "", priority: "Medium", deadline: "", day: "All", time: "", notes: "" });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.topic.trim()) return;

    setLoading(true);
    const newTask = {
      subject: form.subject.trim(),
      topic: form.topic.trim(),
      priority: form.priority,
      deadline: form.deadline || null,
      day: form.day || "All",
      time: form.time || "",
      notes: form.notes || "",
      done: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/planner/create`, newTask, { withCredentials: true });
      toast.success("Task added successfully");
      setOpen(false);
      getData();
      resetForm();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(id: number, done: boolean) {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/planner/${id}`, { done }, { withCredentials: true });
      toast.success("Task updated successfully");
      getData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update task");
    }
  }

  async function removeTask(id: number) {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/planner/${id}`, { withCredentials: true });
      getData();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete task");
    }
  }

  function priorityClass(p: string) {
    switch (p) {
      case "High":
        return "border border-red-300 text-red-500 font-semibold";
      case "Low":
        return "border border-emerald-300 text-emerald-500 font-semibold";
      default:
        return "border border-yellow-300 text-yellow-500 font-semibold";
    }
  }

  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="md:p-6 max-w-9xl mx-auto relative">
      <h1 className="text-2xl md:text-3xl font-semibold mb-5 flex items-center justify-center">Study Planner</h1>
      <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-card p-4 rounded-full border">
          <h4>Total Tasks</h4>
          <h2 className="font-semibold text-primary">{tasks.length}</h2>
        </div>
        <div className="flex items-center gap-2 bg-card p-4 rounded-full border">
          <h4>Task Completed</h4>
          <h2 className="font-semibold text-primary">{tasks.filter((t: any) => t.done).length}</h2>
        </div>
        <div className="flex items-center gap-2 bg-card p-4 rounded-full border">
          <h4>High Priority</h4>
          <h2 className="font-semibold text-red-600">{tasks.filter((t: any) => t.priority === "High").length}</h2>
        </div>
        <Button onClick={() => setOpen(true)} className="cursor-pointer rounded-full text-md py-7">
          <Plus className="size-5" /> Add Task
        </Button>
      </div>

      <div className="">
        <div className="md:col-span-2 space-y-4">
          <Card className="">
            <CardHeader className="flex flex-col md:items-start md:justify-between gap-3">
              <div>
                <CardTitle>Planned Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Break big study goals into smaller tasks and assign priorities & deadlines.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => setViewDay(d)}
                    className={`px-3 py-1 rounded-md text-sm cursor-pointer ${viewDay === d ? "bg-primary text-white" : "bg-slate-100 text-slate-800"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tasks.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">No tasks yet — add your first study task.</div>}

                {tasks?.map((task: any) => (
                  <div key={task._id} className={`border rounded-lg p-4 ${task.done ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-3 flex-col xl:flex-row">
                      <div>
                        <h3 className="text-lg font-medium">
                          {task.subject} — <span className="text-sm font-normal">{task.topic}</span>
                        </h3>
                        <div className="mt-1 text-sm text-muted-foreground">{task.notes}</div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${priorityClass(task.priority)}`}>{task.priority}</span>

                          {task.deadline && <span className="px-2 py-1 text-xs rounded bg-sky-100 text-sky-700">Due: {format(new Date(task.deadline), "MMM d, yyyy")}</span>}

                          {task.day !== "All" && <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">{task.day}</span>}

                          {task.time && <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">{task.time}</span>}
                        </div>
                      </div>

                      <div className="flex flex-col xl:items-end gap-2">
                        <p className="text-sm text-muted-foreground whitespace-nowrap">Added: {format(new Date(task.createdAt), "MMM d, hh:mm a")}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant={task.done ? "secondary" : "default"} onClick={() => toggleDone(task._id, !task.done)} className="cursor-pointer rounded">
                            {task.done ? "Undone" : "Done"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeTask(task._id)} className="cursor-pointer rounded">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add / Plan Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-4">
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g. Math, Biology" className="mt-2 rounded" />
            </div>

            <div>
              <Label>Topic</Label>
              <Input
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="e.g. Integration, Photosynthesis"
                className="mt-2 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2">Priority</Label>
                <Select value={form.priority} onValueChange={(val) => setForm((f) => ({ ...f, priority: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Day</Label>
                <Select value={form.day} onValueChange={(val) => setForm((f) => ({ ...f, day: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="mt-2 rounded" />
              </div>

              <div>
                <Label>Time slot</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="mt-2 rounded" />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional details"
                className="mt-2 rounded resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" className="cursor-pointer rounded" onClick={resetForm} variant={"outline"}>
                Clear
              </Button>
              <Button type="submit" className="cursor-pointer rounded" disabled={loading}>
                {loading ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
