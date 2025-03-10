import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/add-subject")({
	component: AddSubject,
});

function AddSubject() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			subjects: "",
		},
		onSubmit: async ({ value }) => {
			try {
				const response = await api.attendence["add-subject"].$post({
					json: {
						subjects: [{ sname: value.subjects }],
						id: 2, // Assuming a valid studentId
					},
				});

				if (response.ok) {
					// Invalidate the attendance query to trigger a refetch
					queryClient.invalidateQueries({ queryKey: ["attendance"] });
					// Navigate back to the home page
					navigate({ to: "/" });
				} else {
					console.error("Failed to add subject");
				}
			} catch (error) {
				console.error(error);
			}
		},
	});

	return (
		<div className="p-2">
			<h2>Add Subject</h2>

			<form
				className="max-w-xl m-auto"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				{/* Input Field */}
				<form.Field name="subjects">
					{(field) => (
						<>
							<Label htmlFor={field.name}>Subject</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.isTouched && field.state.meta.errors.length ? (
								<em>{field.state.meta.errors.join(", ")}</em>
							) : null}
						</>
					)}
				</form.Field>

				{/* Submit Button */}
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit}>
							{isSubmitting ? "..." : "Submit"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
