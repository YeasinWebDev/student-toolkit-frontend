import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, BarChart, XAxis, YAxis, Bar } from "recharts";
import toast from "react-hot-toast";
import axios from "axios";

export default function DeepTimer() {
  const [time, setTime] = useState(2 * 60);
  const [currentTime, setCurrentTime] = useState(2 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusText, setFocusText] = useState("");
  const [dailyFocus, setDailyFocus] = useState([]);
  const [weeklyFocus, setWeeklyFocus] = useState([]);
  const intervalRef = useRef<NodeJS.Timeout>(null);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatWeeklyData = (data: any) => {
    if (!data || data.length === 0) return [];

    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return data.map((item: any) => {
      const date = new Date(item._id);
      const dayOfWeek = date.getDay();

      return {
        ...item,
        day: dayMap[dayOfWeek],
      };
    });
  };

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      const logSession = async () => {
        clearInterval(intervalRef.current as unknown as number);
        setIsRunning(false);
        const payload = { task: focusText, seconds: currentTime };
        try {
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/timer/create`, payload, { withCredentials: true });
          setTime(2 * 60);
          setCurrentTime(2 * 60);
          setFocusText("");
          getDailyTimer();
          toast.success("Session logged successfully!");
        } catch (error) {
          console.log(error);
          toast.error("Failed to log session");
        }
      };
      logSession();
    }

    return () => clearInterval(intervalRef.current as unknown as number);
  }, [isRunning, time]);

  useEffect(() => {
    getDailyTimer();
  }, []);

  const getDailyTimer = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/timer`, { withCredentials: true });
      setDailyFocus(res?.data?.data?.ans || []);
      setWeeklyFocus(formatWeeklyData(res?.data?.data?.ans2) || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartPause = () => {
    if (!focusText.trim() && !isRunning) {
      toast.error("Please enter a description before starting the timer.");
      return;
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setTime(2 * 60);
    setCurrentTime(0);
    setIsRunning(false);
  };

  const handleModeChange = (minutes: number) => {
    setTime(minutes * 60);
    setCurrentTime(minutes * 60);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center justify-center p-6 shadow-lg rounded-2xl">
        <h2 className="text-4xl font-bold">Deep Work</h2>
        <p className="text-sm text-gray-500 pt-1">Focused sessions to boost productivity</p>
        <div className="pt-4">
          <input
            type="text"
            placeholder="What will you focus on?"
            value={focusText}
            onChange={(e) => setFocusText(e.target.value)}
            className="border p-2 rounded-md w-full text-center"
          />
          <div className="text-6xl font-mono flex items-center justify-center pt-3">{formatTime(time)}</div>
          <div className="flex space-x-3 items-center justify-center py-3">
            <Button className="cursor-pointer" onClick={handleStartPause}>
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button className="cursor-pointer" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" className="cursor-pointer" onClick={() => handleModeChange(2)}>
              2 min
            </Button>
            <Button variant="outline" className="cursor-pointer" onClick={() => handleModeChange(5)}>
              5 min
            </Button>
            <Button variant="outline" className="cursor-pointer" onClick={() => handleModeChange(25)}>
              25 min
            </Button>
            <Button variant="outline" className="cursor-pointer" onClick={() => handleModeChange(50)}>
              50 min
            </Button>
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="flex items-center justify-center gap-5 flex-col lg:flex-row w-full">
        <div className="p-6 shadow-lg md:flex-1 w-full bg-card rounded-2xl">
          <h2 className="text-xl mb-3 md:text-2xl font-bold">Today Focus Analytics</h2>
          <div>
            {dailyFocus.length === 0 ? (
              <p className="text-gray-500">No tasks completed yet. Start a Pomodoro!</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={dailyFocus} dataKey="seconds" nameKey="task" cx="50%" cy="50%" outerRadius={80} fill="#6366f1" label={(entry) => entry.task.slice(0, 10)}>
                    {dailyFocus?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${Math.floor(value / 60)} min`} />
                  <Legend formatter={(value: string) => value.slice(0, 10)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 shadow-lg md:flex-1 w-full bg-card rounded-2xl">
          <h2 className="text-xl mb-3 md:text-2xl font-bold whitespace-nowrap">Last 7 Days Focus Analytics</h2>
          <div>
            {weeklyFocus.length === 0 ? (
              <p className="text-gray-500">No focus sessions in the last 7 days.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyFocus}>
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(val) => `${Math.floor(val / 60)}m`} />
                  <Tooltip formatter={(value: number) => `${Math.floor(value / 60)} min`} itemStyle={{ color: "black" }} labelStyle={{ color: "black" }} />

                  <Legend />
                  <Bar dataKey="total_Time" fill="#efb100" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        {/* <Card className="md:p-6 shadow-lg md:flex-1 w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Last 7 Days Focus Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyFocus.length === 0 ? (
              <p className="text-gray-500">No focus sessions in the last 7 days.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyFocus}>
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(val) => `${Math.floor(val / 60)}m`} />
                  <Tooltip formatter={(value: number) => `${Math.floor(value / 60)} min`} itemStyle={{ color: "black" }} labelStyle={{ color: "black" }} />

                  <Legend />
                  <Bar dataKey="total_Time" fill="#efb100" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
