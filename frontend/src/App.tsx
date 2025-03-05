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
import { api } from "@/lib/api";
// Define a type for the subject attendance data
type SubjectAttendance = {
	[key: string]: number;
};

// Define a type guard to check the response type
function isSuccessResponse(response: any): response is {
	id: number;
	name: string;
	attendance: { subject: string; present: boolean }[];
	totalAttendance: { [x: string]: number };
} {
	return response && "totalAttendance" in response;
}

function App() {
	const [subjects, setSubjects] = useState<SubjectAttendance>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await api.attendence.attend[":id{[0-9]+}"].$get({
					param: { id: "1" },
				});
				const data = await response.json();

				// Check if the response is successful
				if (isSuccessResponse(data)) {
					setSubjects(data.totalAttendance);
					setError(null);
				} else {
					// Handle error response
					setError(data.error || "Unknown error occurred");
					setSubjects({});
				}
			} catch (error) {
				console.error("Error fetching attendance data:", error);
				setError("Failed to fetch attendance data");
				setSubjects({});
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
			) : error ? (
				<div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
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
