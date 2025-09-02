import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface IAllData {
  question: string;
  answer: string;
  correctAnswer: string;
}

function QuestionGenerator() {
  const [type, setType] = useState("easy");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [allData, setAllData] = useState<IAllData[]>([]);
  const [open, setOpen] = useState(false)

  // Add question
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("true");
  const [newDifficulty, setNewDifficulty] = useState("easy");

  useEffect(() => {
    fetchQuestions();
  }, [type]);

  const fetchQuestions = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/questions?type=${type}`);
    setQuestions(res?.data?.data);
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);
    setScore(null);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: value,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/questions/submit`, { answers, type }, { withCredentials: true }).then((res) => {
        setScore(res?.data?.data?.score);
        setAllData(res?.data?.data?.allData);
        setFinished(true);
      });
    }
  };

  const handleRestart = () => {
    fetchQuestions();
  };

  const handleAddQuestion = async () => {
    if (newQuestion === "" || newAnswer === "" || newDifficulty === "") return toast.error("All fields are required");
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/create`,
        {
          question: newQuestion,
          answer: newAnswer,
          type: newDifficulty,
        },
        { withCredentials: true }
      );
      setNewQuestion("");
      setNewAnswer("true");
      setNewDifficulty("easy");
      fetchQuestions();
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-3xl font-bold">🎯 Question Generator</h2>

      <div className="flex gap-4">
        <Select onValueChange={setType} defaultValue="easy">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer rounded">
              ➕ Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <Label>Question</Label>
                <Input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Enter question" className="rounded mt-2" />
              </div>

              <div>
                <Label>Correct Answer</Label>
                <RadioGroup value={newAnswer} onValueChange={setNewAnswer} className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2">Difficulty</Label>
                <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleAddQuestion} className="cursor-pointer rounded">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!finished && currentQuestion && (
        <div className="shadow-lg rounded-2xl p-6 w-[24rem] flex flex-col gap-6 border">
          <div className="text-sm text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </div>

          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>

          <RadioGroup className="flex flex-col gap-3" value={answers[currentQuestion._id] || ""} onValueChange={handleAnswerChange}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="true" id={`true-${currentIndex}`} />
              <Label htmlFor={`true-${currentIndex}`} className="text-base">
                ✅ True
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="false" id={`false-${currentIndex}`} />
              <Label htmlFor={`false-${currentIndex}`} className="text-base">
                ❌ False
              </Label>
            </div>
          </RadioGroup>

          <Button onClick={handleNext} disabled={!answers[currentQuestion._id]} className="w-full cursor-pointer">
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      )}

      {finished && score !== null && (
        <div className="shadow-xl rounded-2xl p-6 w-[28rem] flex flex-col gap-6 border">
          <h3 className="text-2xl font-bold text-center">🎉 Quiz Finished!</h3>
          <p className="text-center text-lg">
            Your Score:{" "}
            <span className="font-bold text-green-600">
              {score}/{questions.length}
            </span>
          </p>
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {allData?.map((q, i) => (
              <div key={i} className="p-3 rounded-lg border text-sm flex flex-col gap-1">
                <span className="font-medium text-gray-300">
                  Q{i + 1}: {q.question}
                </span>
                <span>
                  Your Answer:{" "}
                  <span className={q.answer === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                    <b>{q.answer || "No answer"}</b>
                  </span>
                </span>
                <span className="text-gray-400">
                  Correct Answer: <b className="text-green-600">{q.correctAnswer}</b>
                </span>
              </div>
            ))}
          </div>

          <Button onClick={handleRestart} variant="outline" className="w-full cursor-pointer">
            🔄 Restart Quiz
          </Button>
        </div>
      )}
    </div>
  );
}

export default QuestionGenerator;
