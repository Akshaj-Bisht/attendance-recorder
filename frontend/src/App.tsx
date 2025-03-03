import { useEffect, useState } from "react";
import "./App.css";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// Define a type for the subject attendance data
type SubjectAttendance = {
	[key: string]: number;
};

function App() {
	const [subjects, setSubjects] = useState<SubjectAttendance>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch("/api/attendence/attend/1");
				const data = await response.json();
				setSubjects(data.totalAttendance);
			} catch (error) {
				console.error("Error fetching attendance data:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	// Convert subjects object to array of [subject, count] entries for mapping
	const subjectEntries = Object.entries(subjects);

	return (
		<div className="p-4 flex flex-wrap gap-4 justify-center">
			{loading ? (
				<p>Loading attendance data...</p>
			) : subjectEntries.length === 0 ? (
				<p>No attendance data available</p>
			) : (
				subjectEntries.map(([subject, count]) => (
					<Card key={subject} className="w-[350px]">
						<CardHeader>
							<CardTitle>{subject}</CardTitle>
							<CardDescription>Student Attendance</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-xl font-semibold">Total Classes: {count}</p>
						</CardContent>
						<CardFooter className="text-sm text-gray-500">
							Last updated: {new Date().toLocaleDateString()}
						</CardFooter>
					</Card>
				))
			)}
		</div>
	);
}

export default App;
