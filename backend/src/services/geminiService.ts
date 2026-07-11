import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface CrmLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE";
  crm_note: string;
  data_source: "leads_on_demand" | "meridian_tower" | "eden_park" | "varah_swamy" | "sarjapur_plots" | "";
  possession_time: string;
  description: string;
}

const SYSTEM_INSTRUCTION = `
You are an expert CRM data parser. Map the provided raw records into the standard GrowEasy CRM JSON format.

Mapping Instructions:
1. name: Extract full name.
2. email: Primary email. If multiple exist, put the first in 'email' and append others to 'crm_note'.
3. country_code & mobile_without_country_code: Parse phone numbers. Split country code (e.g. +91, +1) and core digits (e.g. 9876543210). If multiple phones exist, use the first and append others to 'crm_note'.
4. created_at: Standardize dates to YYYY-MM-DD HH:mm:ss format so it is convertible using JavaScript new Date().
5. crm_status: Match exactly to: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. Default to GOOD_LEAD_FOLLOW_UP if missing.
6. data_source: Match exactly to: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. If no confident match, leave as empty string.
7. crm_note: Store remarks, comments, extra phones, extra emails, or other metadata.
8. Skip Invalid Records: Exclude any record that has NEITHER an email nor a mobile number.
9. No Hallucinations: If a field does not exist, leave it as an empty string.
`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    records: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          created_at: { type: "STRING" },
          name: { type: "STRING" },
          email: { type: "STRING" },
          country_code: { type: "STRING" },
          mobile_without_country_code: { type: "STRING" },
          company: { type: "STRING" },
          city: { type: "STRING" },
          state: { type: "STRING" },
          country: { type: "STRING" },
          lead_owner: { type: "STRING" },
          crm_status: {
            type: "STRING",
            enum: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]
          },
          crm_note: { type: "STRING" },
          data_source: {
            type: "STRING",
            enum: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots", ""]
          },
          possession_time: { type: "STRING" },
          description: { type: "STRING" }
        },
        required: [
          "created_at", "name", "email", "country_code", "mobile_without_country_code",
          "company", "city", "state", "country", "lead_owner", "crm_status",
          "crm_note", "data_source", "possession_time", "description"
        ]
      }
    }
  },
  required: ["records"]
};

export const mapRecordsWithAI = async (rawRecords: any[]): Promise<CrmLead[]> => {
  if (!ai || process.env.MOCK_MODE === "true") {
    return rawRecords.map((row) => {
      const keys = Object.keys(row);
      const findValue = (possibleKeys: string[], excludeKeys: string[] = []): string => {
        const foundKey = keys.find(k =>
          possibleKeys.some(pk => k.toLowerCase().includes(pk.toLowerCase())) &&
          !excludeKeys.some(ek => k.toLowerCase().includes(ek.toLowerCase()))
        );
        return foundKey ? String(row[foundKey]) : "";
      };

      const rawPhone = findValue(["phone", "mobile", "contact", "number", "tel"], ["email", "mail"]);
      let countryCode = "";
      let phoneWithoutCode = rawPhone.replace(/\D/g, "");
      if (rawPhone.startsWith("+")) {
        const match = rawPhone.match(/^\+(\d{1,3})/);
        if (match) {
          countryCode = `+${match[1]}`;
          phoneWithoutCode = rawPhone.substring(match[0].length).replace(/\D/g, "");
        }
      }

      const email = findValue(["email", "mail"]);
      const name = findValue(["name", "client"], ["company", "org"]);

      return {
        created_at: findValue(["date", "time", "created"]) || new Date().toISOString().slice(0, 19).replace("T", " "),
        name: name,
        email: email,
        country_code: countryCode || "+91",
        mobile_without_country_code: phoneWithoutCode,
        company: findValue(["company", "org"]),
        city: findValue(["city"]),
        state: findValue(["state"]),
        country: findValue(["country"]),
        lead_owner: findValue(["owner", "agent"]) || "Default Owner",
        crm_status: "GOOD_LEAD_FOLLOW_UP",
        crm_note: findValue(["note", "remark", "comment"]),
        data_source: "",
        possession_time: "",
        description: findValue(["desc", "details"])
      };
    });
  }

  const prompt = `Map these raw rows: ${JSON.stringify(rawRecords)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: responseSchema as any
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI model");
  }

  const parsed = JSON.parse(text);
  return (parsed.records || []) as CrmLead[];
};
