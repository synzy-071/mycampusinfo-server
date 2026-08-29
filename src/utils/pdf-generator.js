// utils/pdf-generator.js
import PDFDocument from "pdfkit";

const safe = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
};

export const generateStudentPDFBuffer = (maybeStudent) => {
  return new Promise((resolve, reject) => {
    try {
      // normalize input (accept array or single object)
      let student = maybeStudent;
      if (Array.isArray(maybeStudent)) {
        if (maybeStudent.length === 0) return reject(new Error("Empty application array"));
        student = maybeStudent[0];
      }
      if (!student || typeof student !== "object")
        return reject(new Error("Invalid student/application object"));

      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // convenience values
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = doc.page.margins.left; // left & right same by default
      const contentWidth = pageWidth - margin * 2;

      // table layout settings
      const labelColWidth = Math.floor(contentWidth * 0.35);
      const valueColWidth = contentWidth - labelColWidth - 10; // small gap
      const defaultRowPadding = 6; // top+bottom padding inside a row
      const minRowHeight = 18;

      // draw section title
      const drawSectionTitle = (title) => {
        doc.moveDown(0.2);
        doc.fontSize(14).font("Helvetica-Bold").text(title, { align: "left" });
        doc.moveDown(0.25);
      };

      // draw simple horizontal rule
      const hr = () => {
        const x1 = margin;
        const x2 = pageWidth - margin;
        const y = doc.y;
        doc.moveTo(x1, y).lineTo(x2, y).strokeColor("#cccccc").lineWidth(0.5).stroke();
        doc.moveDown(0.5);
      };

      // helper to ensure we have space for a block of height; if not, add page and reposition
      const ensureSpace = (neededHeight, repeatHeaderFn) => {
        const cursorY = doc.y;
        const bottomLimit = pageHeight - margin;
        if (cursorY + neededHeight > bottomLimit) {
          doc.addPage();
          // repeat header if provided (e.g., table header)
          if (repeatHeaderFn) repeatHeaderFn();
        }
      };

      // draws table header row (label/value column titles)
      const drawTableHeader = (label = "Field", value = "Value") => {
        const x = margin;
        const y = doc.y;
        const headerHeight = 18;
        // background
        doc.rect(x, y, contentWidth, headerHeight).fillAndStroke("#f0f0f0", "#aaaaaa");
        doc.fillColor("#000000");
        // text
        doc.fontSize(10).font("Helvetica-Bold")
          .text(label, x + 6, y + 4, { width: labelColWidth - 12, align: "left" });
        doc.text(value, x + labelColWidth + 6, y + 4, { width: valueColWidth - 12, align: "left" });
        doc.moveDown();
        doc.moveDown(0.2);
      };

      // draw one table row with dynamic height
      const drawTableRow = (label, value) => {
        label = safe(label);
        value = safe(value);

        // compute text heights (for label and value wrapped)
        const labelOptions = { width: labelColWidth - 12, align: "left" };
        const valueOptions = { width: valueColWidth - 12, align: "left" };
        const labelHeight = Math.max(minRowHeight, doc.heightOfString(label, { ...labelOptions, continued: false }));
        const valueHeight = Math.max(minRowHeight, doc.heightOfString(value, valueOptions));
        const contentHeight = Math.max(labelHeight, valueHeight);
        const rowHeight = contentHeight + defaultRowPadding;

        // if not enough space, add page and re-draw table header
        ensureSpace(rowHeight + 6, () => {
          drawTableHeader(); // redraw header on new page
        });

        const x = margin;
        const y = doc.y;

        // draw row background (alternating not necessary but could)
        // draw left label cell border
        doc.save();
        doc.rect(x, y, contentWidth, rowHeight).strokeColor("#cccccc").lineWidth(0.5).stroke();

        // draw vertical divider
        doc.moveTo(x + labelColWidth, y).lineTo(x + labelColWidth, y + rowHeight).strokeColor("#cccccc").lineWidth(0.5).stroke();

        // write label and value
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000")
          .text(label, x + 6, y + 4, { width: labelColWidth - 12, align: "left" });

        doc.font("Helvetica").fontSize(10).fillColor("#000000")
          .text(value, x + labelColWidth + 6, y + 4, { width: valueColWidth - 12, align: "left" });

        // advance cursor by rowHeight
        doc.moveDown(0);
        // programmatically set y to y + rowHeight to avoid heightOfString floating rounding issues
        doc.y = y + rowHeight + 4; // small gap after row
        doc.restore();
      };

      // Start document
      doc.fontSize(18).font("Helvetica-Bold").text("Student Application Summary", { align: "center" });
      doc.moveDown(0.2);
      doc.fontSize(9).font("Helvetica-Oblique").text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
      doc.moveDown(0.8);
      hr();

      // function to draw an array of rows as a titled section with table header and repeated header on page breaks
      const drawSectionAsTable = (title, rows) => {
        drawSectionTitle(title);
        drawTableHeader("Field", "Value");

        // draw each row
        rows.forEach(([label, value]) => {
          drawTableRow(label, value);
        });

        // small spacing after section
        doc.moveDown(0.5);
        hr();
      };

      // Application Details (Main Box at top)
      const appDetailsRows = [
        ["Application Date", student.createdAt ? new Date(student.createdAt).toLocaleDateString() : new Date().toLocaleDateString()],
        ["College Applying To", student.collegeName ?? "-"],
        ["College Email", student.collegeEmail ?? "-"]
      ];

      if (student.coursePreferences && student.coursePreferences.length > 0) {
         student.coursePreferences
           .sort((a,b) => (a.priority || 99) - (b.priority || 99))
           .forEach(pref => {
               appDetailsRows.push([`Course Preference ${pref.priority ?? "-"}`, pref.courseName ?? "-"]);
           });
      }

      drawSectionAsTable("Application Details", appDetailsRows);

      // Student Basic Info
      drawSectionAsTable("Student Basic Information", [
        ["Name", student.name || student.nameOfChild],
        ["Location", student.location ?? "-"],
        ["Date of Birth", student.dob ? new Date(student.dob).toLocaleDateString() : "-"],
        ["Age", student.age ?? "-"],
        ["Gender", student.gender ?? "-"],
        ["Category", student.category ?? "-"],
        ["Mother Tongue", student.motherTongue ?? "-"],
        ["Place of Birth", student.placeOfBirth ?? "-"],
        ["Specially Abled", student.speciallyAbled ? "Yes" : "No"],
        ["Specially Abled Type", student.speciallyAbledType ?? "-"],
        ["Nationality", student.nationality ?? "-"],
        ["Religion", student.religion ?? "-"],
        ["Caste", student.caste ?? "-"],
        ["Subcaste", student.subcaste ?? "-"],
        ["Aadhar Number", student.aadharNo ?? "-"],
        ["Blood Group", student.bloodGroup ?? "-"],
        ["Allergic To", student.allergicTo ?? "-"],
        ["Interest", student.interest ?? "-"],
        ["Home Language", student.homeLanguage ?? "-"],
        ["Yearly Budget", student.yearlyBudget ?? "-"]
      ]);

      // Previous School & Address (each as its own section)
      drawSectionAsTable("Previous Academic Information", [
        ["Last Institute Name", student.lastcollegeName || student.lastSchoolName || "-"],
        ["Class Completed", student.classCompleted ?? "-"],
        ["Last Academic Year", student.lastAcademicYear ?? "-"],
        ["Reason For Leaving", student.reasonForLeaving ?? "-"],
        ["Board", student.board ?? "-"]
      ]);

      drawSectionAsTable("Address Information", [
        ["Present Address", student.presentAddress ?? "-"],
        ["Permanent Address", student.permanentAddress ?? "-"]
      ]);

      if (student.latestQualification || student.academicDetails || student.currentGrade || student.stream) {
        drawSectionAsTable("Academic Details", [
          ["Latest Qualification", student.latestQualification?.level ?? "-"],
          ["Current Grade", student.currentGrade ?? "-"],
          ["Stream", student.academicDetails?.stream ?? student.stream ?? "-"],
          ["Overall Percentage", student.academicDetails?.overallPercentage ?? "-"]
        ]);
        
        if (student.academicDetails?.subjects && student.academicDetails.subjects.length > 0) {
           const subjectRows = student.academicDetails.subjects.map(sub => [
             sub.subjectName ?? "-", 
             `${sub.marksObtained ?? "-"} / ${sub.maxMarks ?? "-"}`
           ]);
           drawSectionAsTable("Subject Marks", subjectRows);
        }
      }

      // Course preferences moved to Application Details section at the top

      // Add new page for parent/guardian details if current page is too full
      doc.addPage();

      if (student.guardianName || student.guardianContactNo || student.guardianEmail) {
        drawSectionAsTable("Guardian Details", [
          ["Name", student.guardianName ?? "-"],
          ["Age", student.guardianAge ?? "-"],
          ["Qualification", student.guardianQualification ?? "-"],
          ["Profession", student.guardianProfession ?? "-"],
          ["Annual Income", student.guardianAnnualIncome ?? "-"],
          ["Phone No", student.guardianContactNo ?? "-"],
          ["Email", student.guardianEmail ?? "-"],
          ["Aadhar No", student.guardianAadharNo ?? "-"],
          ["Relation", student.guardianRelationToStudent ?? "-"]
        ]);
      }

      drawSectionAsTable("Father Details", [
        ["Name", student.fatherName ?? "-"],
        ["Age", student.fatherAge ?? "-"],
        ["Qualification", student.fatherQualification ?? "-"],
        ["Profession", student.fatherProfession ?? "-"],
        ["Annual Income", student.fatherAnnualIncome ?? "-"],
        ["Phone No", student.fatherPhoneNo ?? "-"],
        ["Aadhar No", student.fatherAadharNo ?? "-"],
        ["Email", student.fatherEmail ?? "-"]
      ]);

      drawSectionAsTable("Mother Details", [
        ["Name", student.motherName ?? "-"],
        ["Age", student.motherAge ?? "-"],
        ["Qualification", student.motherQualification ?? "-"],
        ["Profession", student.motherProfession ?? "-"],
        ["Annual Income", student.motherAnnualIncome ?? "-"],
        ["Phone No", student.motherPhoneNo ?? "-"],
        ["Aadhar No", student.motherAadharNo ?? "-"],
        ["Email", student.motherEmail ?? "-"]
      ]);

      drawSectionAsTable("Family Information", [
        ["Relationship Status", student.relationshipStatus ?? "-"]
      ]);


      // siblings
      if (Array.isArray(student.siblings) && student.siblings.length > 0) {
        doc.addPage();
        student.siblings.forEach((sibling, idx) => {
          drawSectionAsTable(`Sibling ${idx + 1}`, [
            ["Name", sibling.name ?? "-"],
            ["Age", sibling.age ?? "-"],
            ["Sex", sibling.sex ?? "-"],
            ["Institute", sibling.nameOfInstitute ?? "-"],
            ["Class", sibling.className ?? "-"]
          ]);
        });
      }

      // Footer
      doc.moveDown(1);
      doc.fontSize(9).font("Helvetica-Oblique").text("This document is system generated and does not require signature.", {
        align: "center"
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
