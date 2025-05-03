const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePayslip = (employee, payroll) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `payslip_${employee._id}_${payroll.salaryMonth}.pdf`;
    const filepath = path.join(__dirname, '..', 'uploads', filename);
    const writeStream = fs.createWriteStream(filepath);

    doc.pipe(writeStream);

    doc.fontSize(20).text('HRMS Pro - Payslip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Employee Name: ${employee.name}`);
    doc.text(`Email: ${employee.email}`);
    doc.text(`Department: ${employee.department}`);
    doc.text(`Job Role: ${employee.jobRole}`);
    doc.moveDown();
    doc.text(`Month: ${payroll.salaryMonth}`);
    doc.text(`Base Salary: ₹${payroll.baseSalary}`);
    doc.text(`Tax Deduction: ₹${payroll.deductions.tax}`);
    doc.text(`PF Deduction: ₹${payroll.deductions.pf}`);
    doc.text(`Other Deductions: ₹${payroll.deductions.other}`);
    doc.text(`Net Salary: ₹${payroll.netSalary}`);
    doc.moveDown();
    doc.text(`Status: ${payroll.status}`);
    doc.end();

    writeStream.on('finish', () => resolve(filepath));
    writeStream.on('error', reject);
  });
};

module.exports = generatePayslip;
