import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "./FormField";

const schema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

function TestForm() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <FormField
        control={control}
        name="email"
        label="Email"
        inputProps={{ type: "email" }}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe("FormField", () => {
  it("renders input bound to react-hook-form", () => {
    render(<TestForm />);
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");
  });
});
