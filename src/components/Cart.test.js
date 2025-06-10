import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Cart from "./Cart";

const mockCart = [
  {
    name: "Haircut",
    provider: { name: "John" },
    timeSlot: "10:00 AM",
    price: 30,
    duration: 45,
  },
  {
    name: "Beard Trim",
    provider: { name: "Jane" },
    timeSlot: "11:00 AM",
    price: 20,
    duration: 30,
  }
];

describe("Cart component", () => {
  test("renders cart items and summary", () => {
    render(<Cart cart={mockCart} />);

    expect(screen.getByText(/Haircut/)).toBeInTheDocument();
    expect(screen.getByText(/Beard Trim/)).toBeInTheDocument();
    expect(screen.getByText(/75 mins/)).toBeInTheDocument();      
    expect(screen.getByText(/\$50/)).toBeInTheDocument();         

  });

  test("shows error if name or email is missing", () => {
    render(<Cart cart={mockCart} />);

    fireEvent.click(screen.getByText("Book Now"));
    expect(screen.getByText("Please fill in both name and email.")).toBeInTheDocument();
  });
});
