import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const attendenceSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	studentId: z.number().int().positive(),
	subjects: z.array(
		z.object({
			sname: z.string(),
			present: z.boolean(),
		})
	),
});

type Attendence = z.infer<typeof attendenceSchema>;

const fakeDB: Attendence[] = [
	{
		id: 1,
		name: "John Doe",
		studentId: 123,
		subjects: [
			{ sname: "Math", present: true },
			{ sname: "Math", present: true },
			{ sname: "Science", present: false },
			{ sname: "Science", present: true },
			{ sname: "Cs", present: true },
		],
	},
];
const createPostSchema = attendenceSchema.omit({ id: true });
export const attdendenceRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "Welcome to the attendence route" });
	})
	.post("/", zValidator("json", createPostSchema), async (c) => {
		const attend = await c.req.valid("json");
		const newAttendence = { ...attend, id: fakeDB.length + 1 };
		fakeDB.push(newAttendence);
		c.status(201);
		return c.json(attend);
	})

	.get("/attend/:id{[0-9]+}", (c) => {
		const id = parseInt(c.req.param("id"));
		const student = fakeDB.find((attend) => attend.id === id);

		if (!student) {
			return c.json({ error: "Student not found" }, 404);
		}

		const attendanceSummary = student.subjects.map((subject) => ({
			subject: subject.sname,
			present: subject.present,
		}));

		const totalAttendance = student.subjects.reduce((acc, subject) => {
			if (subject.present) {
				acc[subject.sname] = (acc[subject.sname] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		return c.json({
			id: student.id,
			name: student.name,
			attendance: attendanceSummary,
			totalAttendance,
		});
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
