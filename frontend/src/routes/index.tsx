import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

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

// Update this type definition to match your updated API response
type AttendanceResponse = {
	id: number;
	name: string;
	attendance: {
		subject: string;
		present: "present" | "absent" | "no class today";
	}[];
	totalAttendance: Record<string, Record<string, number>>;
};

async function fetchTotalAttendance(): Promise<AttendanceResponse> {
	try {
		const response = await api.attendence.attend[":id{[0-9]+}"].$get({
			param: { id: "2" }, // Consider making this dynamic
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

function Index() {
	const { isPending, error, data } = useQuery<AttendanceResponse>({
		queryKey: ["attendance"],
		queryFn: fetchTotalAttendance,
		retry: 1,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	if (isPending) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-gray-500">Loading attendance data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-red-500 p-4 bg-red-50 rounded">
					{error.message}
				</div>
			</div>
		);
	}

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

	// Updated to work with the new structure
	return (
		<div className="p-4 flex flex-wrap gap-4 justify-center">
			{Object.entries(data.totalAttendance).map(([subject, statusCounts]) => {
				const totalClasses = Object.values(statusCounts).reduce(
					(sum, count) => sum + count,
					0
				);
				const presentCount = statusCounts["present"] || 0;
				const attendanceRate =
					totalClasses > 0
						? Math.round((presentCount / totalClasses) * 100)
						: 0;

				return (
					<Card
						key={subject}
						onClick={() => console.log(`Clicked on ${subject}`)}
					>
						<CardHeader>
							<CardTitle>{subject}</CardTitle>
							<CardDescription>Student Attendance</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-xl font-semibold">
								Total Classes: {totalClasses}
							</p>
							<div className="mt-2">
								<p>Present: {statusCounts["present"] || 0}</p>
								<p>Absent: {statusCounts["absent"] || 0}</p>
								<p>No Class: {statusCounts["no class today"] || 0}</p>
								<p className="mt-2 font-medium">
									Attendance Rate: {attendanceRate}%
								</p>
							</div>
						</CardContent>
						<CardFooter className="text-sm text-gray-500">
							Last updated: {new Date().toLocaleDateString()}
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
