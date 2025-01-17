"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

import { chatWithOllama, queryNeonDB } from "@/lib/ai-functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OllamaResponse = {
  summary: string;
  query: string;
};

const QueryPage = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState(
    "This is a summary of the AI's intent.",
  );
  const [sqlQuery, setSqlQuery] = useState(
    "SELECT * FROM grades WHERE lettergrade = 'A';",
  );

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Sample data for demonstration purposes; replace with actual API response handling
    // setResponse("Sample Response"); // Replace with actual response text
    // setResults([{ lettergrade: "A", numericgrade: 8, hello: "aah" }]); // Sample data for demonstration
    // setSummary("This is a summary of the AI's intent."); // Sample summary text
    // setSqlQuery("SELECT * FROM grades WHERE lettergrade = 'A';"); // Sample SQL query text
    try {
      const result = await chatWithOllama(prompt);
      const jsonResult: OllamaResponse = JSON.parse(result);
      const sqlQuery = jsonResult.query;
      setSqlQuery(sqlQuery);
      const neon_response = await queryNeonDB(sqlQuery);
      console.log("RESP", neon_response);
      const summary = jsonResult.summary;
      setSummary(summary);
      setResponse(summary);
      setResults(neon_response as any[]);
    } catch (error) {
      console.error("Error querying model:", (error as Error).message);
    }
  };
  const downloadCSV = () => {
    if (results.length === 0) return;

    const headers = Object.keys(results[0]).join(",");
    const rows = results.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(","),
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "query_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen flex-col items-center text-white">
      <main className="w-full max-w-3xl flex-1 px-4 py-12 md:px-6 md:py-24 lg:py-32">
        <div className="container mx-auto">
          {!response && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="typing-animation text-3xl font-bold sm:text-4xl md:text-5xl">
                Query Your Database...
              </h1>
              <p className="text-gray-400 md:text-xl">
                Enter your query below and receive instant results from the
                database.
              </p>
            </div>
          )}

          {response && (
            <div className="mt-8 text-center">
              <h2 className="mb-4 text-2xl font-bold">Results</h2>
              <div className="mb-4 rounded-lg bg-gray-800 p-4 text-left">
                <p>
                  <strong>SQL Query:</strong> {sqlQuery}
                </p>
                <p>
                  <strong>Summary:</strong> {summary}
                </p>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {Object.keys(results[0] || {}).map((header, index) => (
                        <th
                          key={index}
                          className="border-b border-gray-600 px-4 py-2 text-gray-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-b border-gray-600 px-4 py-2"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                onClick={downloadCSV}
                className="text-md mt-4 font-semibold"
              >
                Download CSV
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Input form at the bottom */}
      <div className="fixed bottom-0 w-full max-w-3xl px-4 py-4">
        <form
          onSubmit={handleQuerySubmit}
          className="flex w-full items-center space-x-2"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something..."
            className="w-full rounded-lg px-4 py-2 font-semibold text-white placeholder-gray-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            Submit
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QueryPage;
