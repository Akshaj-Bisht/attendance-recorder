import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// Schema for attendance records
const attendenceSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	studentId: z.number().int().positive(),
	subjects: z.array(
		z.object({
			sname: z.string(),
			present: z
				.enum(["present", "absent", "no class today"])
				.default("present"),
			date: z.string().optional(),
		})
	),
});

// Schema for adding subjects using ID
const addSubjectSchema = z.object({
	id: z.number().int().positive(),
	subjects: z.array(z.object({ sname: z.string() })),
});

// Schema for marking attendance using ID
const subjectAttendanceSchema = z.object({
	id: z.number().int().positive(),
	subject: z.string(),
	status: z.enum(["present", "absent", "no class today"]).default("present"),
});

type Attendence = z.infer<typeof attendenceSchema>;

const fakeDB: Attendence[] = [
	{
		id: 1,
		name: "John Doe",
		studentId: 123,
		subjects: [
			{ sname: "Math", present: "present", date: "2025-03-05" },
			{ sname: "Science", present: "absent", date: "2025-03-05" },
		],
	},
	{
		id: 2,
		name: "Jane Smith",
		studentId: 124,
		subjects: [{ sname: "Math", present: "present", date: "2025-03-05" }],
	},
];
const createPostSchema = attendenceSchema.omit({ id: true });
export const attdendenceRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "Welcome to the attendence route" });
	})
	.post("/add-subject", zValidator("json", addSubjectSchema), async (c) => {
		const { id, subjects } = await c.req.valid("json");

		// Find student using ID
		const student = fakeDB.find((s) => s.id === id);

		if (!student) {
			return c.json({ error: "Student not found" }, 404);
		}

		// Avoid duplicate subjects
		const existingSubjects = new Set(student.subjects.map((s) => s.sname));
		subjects.forEach((s) => {
			if (!existingSubjects.has(s.sname)) {
				student.subjects.push({ sname: s.sname, present: "present" });
			}
		});

		return c.json({ message: "Subjects added successfully", student });
	})

	.post(
		"/subject-attendance",
		zValidator("json", subjectAttendanceSchema),
		async (c) => {
			const { id, subject, status } = await c.req.valid("json");
			const today = new Date().toISOString().split("T")[0];

			// Find student using ID
			const student = fakeDB.find((s) => s.id === id);

			if (!student) {
				return c.json({ error: "Student not found" }, 404);
			}

			// Add today's attendance for the subject
			student.subjects.push({ sname: subject, present: status, date: today });

			return c.json({
				message: "Attendance recorded successfully",
				student: student.name,
				subject,
				status,
				date: today,
			});
		}
	)

	.get("/attend/:id{[0-9]+}", (c) => {
		const id = parseInt(c.req.param("id"));
		const student = fakeDB.find((attend) => attend.id === id);

		if (!student) {
			return c.json({ error: "Student not found" }, 404);
		}

		const attendanceSummary = student.subjects.map((subject) => ({
			subject: subject.sname,
			present: subject.present,
			date: subject.date || "No date recorded",
		}));

		// Update the reduce function to handle string values
		const totalAttendance = student.subjects.reduce((acc, subject) => {
			// Initialize the subject if it doesn't exist
			if (!acc[subject.sname]) {
				acc[subject.sname] = {
					present: 0,
					absent: 0,
					"no class today": 0,
				};
			}

			// Increment the appropriate counter
			acc[subject.sname][subject.present]++;

			return acc;
		}, {} as Record<string, Record<string, number>>);

		return c.json({
			id: student.id,
			name: student.name,
			attendance: attendanceSummary,
			totalAttendance,
		});
	})

	// Get attendance for a specific date
	.get("/date/:date", (c) => {
		const dateParam = c.req.param("date"); // Format should be YYYY-MM-DD

		const attendanceForDate = fakeDB
			.map((student) => {
				const subjectsOnDate = student.subjects.filter(
					(s) => s.date === dateParam
				);

				return {
					id: student.id,
					name: student.name,
					studentId: student.studentId,
					subjects: subjectsOnDate,
				};
			})
			.filter((student) => student.subjects.length > 0);

		if (attendanceForDate.length === 0) {
			return c.json({ message: "No attendance records for this date" }, 404);
		}

		return c.json(attendanceForDate);
	})

	.get("/:id{[0-9]+}", (c) => {
		const id = Number.parseInt(c.req.param("id"));
		const attend = fakeDB.find((a) => a.id === id);
		if (!attend) {
			return c.notFound();
		}
		return c.json(attend);
	})
	.delete("/:id{[0-9]+}", (c) => {
		const id = Number.parseInt(c.req.param("id"));
		const index = fakeDB.findIndex((a) => a.id === id);
		if (index === -1) {
			return c.notFound();
		}
		const deletedAttend = fakeDB.splice(index, 1)[0];
		return c.json({ attend: deletedAttend });
	});
