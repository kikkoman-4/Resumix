"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#0284c7",
    paddingBottom: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  jobTitle: {
    fontSize: 12,
    color: "#0284c7",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
    fontSize: 8.5,
    color: "#475569",
  },
  contactItem: {
    marginRight: 8,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f172a",
    borderBottomWidth: 0.8,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
    marginBottom: 6,
  },
  summaryText: {
    color: "#334155",
    fontSize: 9.2,
    lineHeight: 1.45,
  },
  entryContainer: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#0f172a",
  },
  entryCompany: {
    color: "#0369a1",
    fontFamily: "Helvetica-Bold",
  },
  entryDates: {
    fontSize: 8.5,
    color: "#64748b",
  },
  entryLocation: {
    fontSize: 8.5,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 3,
  },
  bulletList: {
    marginTop: 3,
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    color: "#0284c7",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#334155",
  },
  skillsCategory: {
    flexDirection: "row",
    marginBottom: 4,
  },
  skillLabel: {
    fontFamily: "Helvetica-Bold",
    width: 140,
    color: "#0f172a",
  },
  skillValue: {
    flex: 1,
    color: "#334155",
  },
});

export const ResumePdfDocument: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  const { personalInfo, summary, workExperiences, educations, projects, skills, sectionOrder } = resume;

  return (
    <Document title={`${personalInfo.fullName} - Resume`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.fullName}</Text>
          <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          <View style={styles.contactRow}>
            {personalInfo.email && <Text style={styles.contactItem}>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text style={styles.contactItem}>• {personalInfo.phone}</Text>}
            {personalInfo.location && <Text style={styles.contactItem}>• {personalInfo.location}</Text>}
            {personalInfo.website && <Text style={styles.contactItem}>• {personalInfo.website}</Text>}
            {personalInfo.linkedin && <Text style={styles.contactItem}>• {personalInfo.linkedin}</Text>}
            {personalInfo.github && <Text style={styles.contactItem}>• {personalInfo.github}</Text>}
          </View>
        </View>

        {/* Dynamic Sections ordered according to sectionOrder */}
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "summary" && summary) {
            return (
              <View key="summary" style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text style={styles.summaryText}>{summary}</Text>
              </View>
            );
          }

          if (sectionKey === "workExperiences" && workExperiences.length > 0) {
            return (
              <View key="workExperiences" style={styles.section}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {workExperiences.map((exp) => (
                  <View key={exp.id} style={styles.entryContainer} wrap={false}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>
                        {exp.position} — <Text style={styles.entryCompany}>{exp.company}</Text>
                      </Text>
                      <Text style={styles.entryDates}>
                        {exp.startDate} - {exp.endDate}
                      </Text>
                    </View>
                    {exp.location && <Text style={styles.entryLocation}>{exp.location}</Text>}
                    <View style={styles.bulletList}>
                      {exp.highlights.map((h, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            );
          }

          if (sectionKey === "skills" && skills.length > 0) {
            return (
              <View key="skills" style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>Skills & Expertise</Text>
                {skills.map((cat) => (
                  <View key={cat.id} style={styles.skillsCategory}>
                    <Text style={styles.skillLabel}>{cat.categoryName}:</Text>
                    <Text style={styles.skillValue}>{cat.items.join(", ")}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (sectionKey === "projects" && projects.length > 0) {
            return (
              <View key="projects" style={styles.section}>
                <Text style={styles.sectionTitle}>Key Projects</Text>
                {projects.map((proj) => (
                  <View key={proj.id} style={styles.entryContainer} wrap={false}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>{proj.name}</Text>
                      {proj.technologies?.length > 0 && (
                        <Text style={styles.entryDates}>[{proj.technologies.join(", ")}]</Text>
                      )}
                    </View>
                    <Text style={styles.summaryText}>{proj.description}</Text>
                    {proj.highlights?.length > 0 && (
                      <View style={styles.bulletList}>
                        {proj.highlights.map((h, i) => (
                          <View key={i} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{h}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            );
          }

          if (sectionKey === "educations" && educations.length > 0) {
            return (
              <View key="educations" style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>Education</Text>
                {educations.map((edu) => (
                  <View key={edu.id} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>
                        {edu.degree} in {edu.fieldOfStudy}
                      </Text>
                      <Text style={styles.entryDates}>
                        {edu.startDate} - {edu.endDate}
                      </Text>
                    </View>
                    <Text style={styles.entryLocation}>
                      {edu.institution} {edu.location ? `• ${edu.location}` : ""} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}
                    </Text>
                    {edu.honors && edu.honors.length > 0 && (
                      <Text style={styles.summaryText}>Honors: {edu.honors.join(", ")}</Text>
                    )}
                  </View>
                ))}
              </View>
            );
          }

          return null;
        })}
      </Page>
    </Document>
  );
};
