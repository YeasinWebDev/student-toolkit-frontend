import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash, Plus, Edit, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import clsx from "clsx";
import axios from "axios";
import toast from "react-hot-toast";

const COLOR_PALETTE = [
  { id: "blue", name: "Blue", class: "bg-blue-500" },
  { id: "green", name: "Green", class: "bg-green-500" },
  { id: "amber", name: "Amber", class: "bg-amber-400" },
  { id: "violet", name: "Violet", class: "bg-violet-500" },
  { id: "rose", name: "Rose", class: "bg-rose-500" },
];

export default function ClassScheduleTracker() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const { state } = useSidebar();

  async function fetchSchedules() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/schedule`, {
        params: {
          search: search || undefined,
        },
        withCredentials: true,
      });
      setEvents(res.data.data);
    } catch (err: any) {
      toast.error("Failed to load schedules");
    }
  }

  useEffect(() => {
    fetchSchedules();
  }, [search]);

  // form state
  const [form, setForm] = useState({
    subject: "",
    instructor: "",
    day: "Monday",
    start: "09:00",
    end: "10:00",
    color: "blue",
    location: "",
  });

  const resetForm = () => setForm({ subject: "", instructor: "", day: "Monday", start: "09:00", end: "10:00", color: "blue", location: "" });

  function handleOpenCreate() {
    resetForm();
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(event: any) {
    setForm({
      subject: event.subject,
      instructor: event.instructor,
      day: event.day,
      start: event.start,
      end: event.end,
      color: event.color,
      location: event.location || "",
    });
    setEditing(event._id);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${id}`, { withCredentials: true });
      toast.success("Class deleted successfully");
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete class");
    }
  }

  function convertTo24Hour(time: string): string {
    if (!time) return "";

    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return time;
    }

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const start24 = convertTo24Hour(form.start);
    const end24 = convertTo24Hour(form.end);

    try {
      if (editing) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${editing}`, { ...form, start: start24, end: end24 }, { withCredentials: true });
        toast.success("Class updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/create`, { ...form, start: start24, end: end24 }, { withCredentials: true });
        toast.success("Class added successfully");
      }

      fetchSchedules();
      setOpen(false);
      resetForm();
      setEditing(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }

  function formatTime(time: string) {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  function colorClass(colorId: string) {
    const c = COLOR_PALETTE.find((x) => x.id === colorId);
    return c ? c.class : "bg-slate-400";
  }

  return (
    <div className="p-4 mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-col">
          <h1 className="text-2xl font-semibold flex items-center gap-2 whitespace-nowrap">
            <CalendarIcon size={20} /> Class Schedule Tracker
          </h1>
          <span className="text-sm text-muted-foreground">Plan your week — add, edit or delete classes</span>
        </div>

        <div className="flex md:items-center gap-2 flex-col md:flex-row">
          <Input placeholder="Search subject, instructor or location" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded w-60" />

          <Button onClick={handleOpenCreate} className="w-fit rounded cursor-pointer">
            <Plus size={16} /> Add Class
          </Button>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Days grid */}
      <div className={clsx("grid gap-4 grid-cols-1", state === "expanded" ? "md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5")}>
        {days.map((day) => {
          const dayEvents = events.filter((e: any) => e.day === day);
          return (
            <Card key={day} className="min-h-[160px]">
              <CardHeader className="flex justify-between items-center p-3">
                <div>
                  <h3 className="font-medium">{day}</h3>
                  <p className="text-xs text-muted-foreground">
                    {dayEvents.length} class{dayEvents.length !== 1 ? "es" : ""}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                {dayEvents.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3">No classes</div>
                ) : (
                  dayEvents.map((ev: IdayEvent) => (
                    <div key={ev._id} className={`rounded-md p-2 mb-2 flex items-start gap-3 border`}>
                      <div className={`w-2 h-20 rounded ${colorClass(ev.color)} shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{ev.subject}</div>
                            <div className="text-xs text-muted-foreground">
                              {ev.instructor} • {ev.location}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(ev.start)} - {formatTime(ev.end)}
                          </div>
                        </div>

                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => handleEdit(ev)}>
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => handleDelete(ev._id)}>
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog (create / edit) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required className="mt-2 rounded" />
              </div>
              <div>
                <Label>Instructor</Label>
                <Input value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} required className="mt-2 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label>Day</Label>
                <Select value={form.day} onValueChange={(value) => setForm((f) => ({ ...f, day: value }))}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select day" />
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

              <div>
                <Label>Start</Label>
                <Input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} required className="mt-2 rounded" />
              </div>

              <div>
                <Label>End</Label>
                <Input type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} required className="mt-2 rounded" />
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="mt-2 rounded" />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c.id }))}
                    className={`w-8 h-8 rounded-full ring-1 ${c.class} ${form.color === c.id ? "ring-2 ring-offset-2 ring-black" : "ring-transparent"}`}
                    aria-label={`Choose ${c.name}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                  resetForm();
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                {editing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface IdayEvent {
  _id: string;
  subject: string;
  instructor: string;
  day: string;
  start: string;
  end: string;
  location: string;
  color: string;
}
