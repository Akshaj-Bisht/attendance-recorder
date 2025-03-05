import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";

// Define types more precisely
type AttendanceResponse = {
	id: number;
	name: string;
	attendance: { subject: string; present: boolean }[];
	totalAttendance: Record<string, number>;
};

// Separate data fetching function with proper typing
async function fetchTotalAttendance(): Promise<AttendanceResponse> {
	try {
		const response = await api.attendence.attend[":id{[0-9]+}"].$get({
			param: { id: "1" }, // Consider making this dynamic
		});

		if (!response.ok) {
			throw new Error("Failed to fetch attendance data");
		}

		return response.json();
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "An unexpected error occurred"
		);
	}
}

function App() {
	const { isPending, error, data } = useQuery<AttendanceResponse>({
		queryKey: ["attendance"],
		queryFn: fetchTotalAttendance,
		// Add retry and stale time for better performance
		retry: 1,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Render loading state
	if (isPending) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-gray-500">Loading attendance data...</p>
			</div>
		);
	}

	// Render error state
	if (error) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-red-500 p-4 bg-red-50 rounded">
					{error.message}
				</div>
			</div>
		);
	}

	// Handle case where no attendance data exists
	if (
		!data?.totalAttendance ||
		Object.keys(data.totalAttendance).length === 0
	) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-gray-500">No attendance data available</p>
			</div>
		);
	}

	// Convert subjects object to array of [subject, count] entries for mapping
	const subjectEntries = Object.entries(data.totalAttendance);

	return (
		<div className="p-4 flex flex-wrap gap-4 justify-center">
			{subjectEntries.map(([subject, count]) => (
				<Card
					key={subject}
					className="w-[350px] hover:shadow-lg transition-shadow duration-300"
				>
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
			))}
		</div>
	);
}

export default App;
