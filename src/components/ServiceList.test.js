/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ServiceList from "./ServiceList";
import * as firebase from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock("../firebaseConfig", () => ({
  db: {},
}));

describe("ServiceList component - categories only", () => {
  const fakeCategories = [
    { id: "cat1", name: "Category 1" },
    { id: "cat2", name: "Category 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    firebase.collection.mockImplementation((db, name) => ({ _collectionName: name }));

    firebase.getDocs.mockImplementation(async (collectionRef) => {
      if (collectionRef._collectionName === "servicesCategory") {
        return {
          docs: fakeCategories.map((cat) => ({
            id: cat.id,
            data: () => ({ name: cat.name }),
          })),
        };
      }
      // Return empty for other collections to keep test simple
      return { docs: [] };
    });
  });

  it("renders service categories", async () => {
    render(
      <ServiceList
        addToCart={jest.fn()}
        selectedProvider={null}
        setSelectedProvider={jest.fn()}
        selectedTime={null}
        setSelectedTime={jest.fn()}
        cart={[]}
        setCart={jest.fn()}
      />
    );

    // Wait for categories to appear
    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText("Category 2")).toBeInTheDocument();
    });
  });
});
