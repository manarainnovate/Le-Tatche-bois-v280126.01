/**
 * RH Documents Translations (FR, EN, AR, ES)
 * Used by all 5 RH PDF generators
 */

export type RHLanguage = 'fr' | 'en' | 'ar' | 'es';

export interface RHTranslations {
  // Common
  company: string;
  date: string;
  signature: string;
  stampAndSignature: string;
  employerSignature: string;
  employeeSignature: string;
  page: string;
  of: string;
  madeAt: string;
  on: string;

  // Note de frais
  expenseReport: string;
  expenseRef: string;
  employee: string;
  department: string;
  period: string;
  from: string;
  to: string;
  expenseDate: string;
  description: string;
  category: string;
  amount: string;
  currency: string;
  receipt: string;
  yes: string;
  no: string;
  totalExpenses: string;
  advanceReceived: string;
  balanceDue: string;
  approvedBy: string;
  categories: {
    transport: string;
    meals: string;
    accommodation: string;
    supplies: string;
    communication: string;
    other: string;
  };

  // Attestation de travail
  workCertificate: string;
  workCertificateTitle: string;
  certifyThat: string;
  bornOn: string;
  at: string;
  cinNumber: string;
  employedSince: string;
  asPosition: string;
  inDepartment: string;
  certificateIssued: string;
  forWhateverPurpose: string;
  currentlyEmployed: string;
  leftCompanyOn: string;

  // Attestation de salaire
  salaryCertificate: string;
  salaryCertificateTitle: string;
  monthlySalary: string;
  grossSalary: string;
  netSalary: string;
  cnssNumber: string;
  salaryInWords: string;

  // Bulletin de paie
  payslip: string;
  payslipTitle: string;
  payPeriod: string;
  baseSalary: string;
  overtime: string;
  bonuses: string;
  grossPay: string;
  cnssDeduction: string;
  irDeduction: string;
  amoDeduction: string;
  otherDeductions: string;
  totalDeductions: string;
  netPay: string;
  employerCharges: string;
  cnssEmployer: string;
  amoEmployer: string;
  taxeProfessionnelle: string;
  workDays: string;
  paidLeave: string;
  sickLeave: string;
  earnings: string;
  deductions: string;

  // Ordre de mission
  missionOrder: string;
  missionOrderTitle: string;
  missionRef: string;
  assignedTo: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  missionPurpose: string;
  transportMode: string;
  accommodation: string;
  estimatedBudget: string;
  approvalStatus: string;
  approved: string;
  pending: string;
  notes: string;
  transportModes: {
    car: string;
    train: string;
    plane: string;
    bus: string;
    other: string;
  };
  employeeInfo: string;
  missionDetails: string;
}

const FR: RHTranslations = {
  company: 'Entreprise',
  date: 'Date',
  signature: 'Signature',
  stampAndSignature: 'Cachet et Signature',
  employerSignature: 'Signature de l\'Employeur',
  employeeSignature: 'Signature de l\'Employé',
  page: 'Page',
  of: 'de',
  madeAt: 'Fait à',
  on: 'Le',

  expenseReport: 'NOTE DE FRAIS',
  expenseRef: 'Réf.',
  employee: 'Employé',
  department: 'Département',
  period: 'Période',
  from: 'Du',
  to: 'Au',
  expenseDate: 'Date',
  description: 'Description',
  category: 'Catégorie',
  amount: 'Montant',
  currency: 'DH',
  receipt: 'Justificatif',
  yes: 'Oui',
  no: 'Non',
  totalExpenses: 'Total des frais',
  advanceReceived: 'Avance reçue',
  balanceDue: 'Solde à rembourser',
  approvedBy: 'Approuvé par',
  categories: {
    transport: 'Transport',
    meals: 'Repas',
    accommodation: 'Hébergement',
    supplies: 'Fournitures',
    communication: 'Communication',
    other: 'Autre',
  },

  workCertificate: 'ATTESTATION DE TRAVAIL',
  workCertificateTitle: 'Attestation de Travail',
  certifyThat: 'Nous soussignés, LE TATCHE BOIS S.A.R.L.A.U, attestons par la présente que :',
  bornOn: 'Né(e) le',
  at: 'à',
  cinNumber: 'Titulaire de la CIN n°',
  employedSince: 'est employé(e) au sein de notre société depuis le',
  asPosition: 'en qualité de',
  inDepartment: 'au sein du département',
  certificateIssued: 'La présente attestation est délivrée à l\'intéressé(e) pour servir et valoir ce que de droit.',
  forWhateverPurpose: 'pour servir et valoir ce que de droit.',
  currentlyEmployed: 'L\'intéressé(e) est toujours en activité à ce jour.',
  leftCompanyOn: 'L\'intéressé(e) a quitté notre société le',

  salaryCertificate: 'ATTESTATION DE SALAIRE',
  salaryCertificateTitle: 'Attestation de Salaire',
  monthlySalary: 'perçoit un salaire mensuel de',
  grossSalary: 'Salaire brut',
  netSalary: 'Salaire net',
  cnssNumber: 'N° CNSS',
  salaryInWords: 'Arrêtée la présente attestation à la somme de',

  payslip: 'BULLETIN DE PAIE',
  payslipTitle: 'Bulletin de Paie',
  payPeriod: 'Période de paie',
  baseSalary: 'Salaire de base',
  overtime: 'Heures supplémentaires',
  bonuses: 'Primes et indemnités',
  grossPay: 'Salaire brut',
  cnssDeduction: 'CNSS (4,48%)',
  irDeduction: 'IR (Impôt sur le revenu)',
  amoDeduction: 'AMO (2,26%)',
  otherDeductions: 'Autres retenues',
  totalDeductions: 'Total retenues',
  netPay: 'Net à payer',
  employerCharges: 'Charges patronales',
  cnssEmployer: 'CNSS patronale (8,98%)',
  amoEmployer: 'AMO patronale (4,11%)',
  taxeProfessionnelle: 'Taxe de formation prof. (1,6%)',
  workDays: 'Jours travaillés',
  paidLeave: 'Congés payés',
  sickLeave: 'Congés maladie',
  earnings: 'RÉMUNÉRATIONS',
  deductions: 'RETENUES',

  missionOrder: 'ORDRE DE MISSION',
  missionOrderTitle: 'Ordre de Mission',
  missionRef: 'Réf. Mission',
  assignedTo: 'Attribué à',
  destination: 'Destination',
  departureDate: 'Date de départ',
  returnDate: 'Date de retour',
  missionPurpose: 'Objet de la mission',
  transportMode: 'Mode de transport',
  accommodation: 'Hébergement',
  estimatedBudget: 'Budget prévisionnel',
  approvalStatus: 'Statut d\'approbation',
  approved: 'Approuvé',
  pending: 'En attente',
  notes: 'Observations',
  transportModes: {
    car: 'Voiture',
    train: 'Train',
    plane: 'Avion',
    bus: 'Autobus',
    other: 'Autre',
  },
  employeeInfo: 'INFORMATIONS EMPLOYÉ',
  missionDetails: 'DÉTAILS DE LA MISSION',
};

const EN: RHTranslations = {
  company: 'Company',
  date: 'Date',
  signature: 'Signature',
  stampAndSignature: 'Stamp & Signature',
  employerSignature: 'Employer Signature',
  employeeSignature: 'Employee Signature',
  page: 'Page',
  of: 'of',
  madeAt: 'Made at',
  on: 'On',

  expenseReport: 'EXPENSE REPORT',
  expenseRef: 'Ref.',
  employee: 'Employee',
  department: 'Department',
  period: 'Period',
  from: 'From',
  to: 'To',
  expenseDate: 'Date',
  description: 'Description',
  category: 'Category',
  amount: 'Amount',
  currency: 'MAD',
  receipt: 'Receipt',
  yes: 'Yes',
  no: 'No',
  totalExpenses: 'Total Expenses',
  advanceReceived: 'Advance Received',
  balanceDue: 'Balance Due',
  approvedBy: 'Approved by',
  categories: {
    transport: 'Transport',
    meals: 'Meals',
    accommodation: 'Accommodation',
    supplies: 'Supplies',
    communication: 'Communication',
    other: 'Other',
  },

  workCertificate: 'WORK CERTIFICATE',
  workCertificateTitle: 'Work Certificate',
  certifyThat: 'We, the undersigned, LE TATCHE BOIS S.A.R.L.A.U, hereby certify that:',
  bornOn: 'Born on',
  at: 'at',
  cinNumber: 'National ID No.',
  employedSince: 'has been employed in our company since',
  asPosition: 'in the position of',
  inDepartment: 'in the department of',
  certificateIssued: 'This certificate is issued to the concerned party for whatever legal purpose it may serve.',
  forWhateverPurpose: 'for whatever legal purpose it may serve.',
  currentlyEmployed: 'The concerned party is still currently employed.',
  leftCompanyOn: 'The concerned party left our company on',

  salaryCertificate: 'SALARY CERTIFICATE',
  salaryCertificateTitle: 'Salary Certificate',
  monthlySalary: 'receives a monthly salary of',
  grossSalary: 'Gross Salary',
  netSalary: 'Net Salary',
  cnssNumber: 'CNSS No.',
  salaryInWords: 'This certificate is issued for the amount of',

  payslip: 'PAYSLIP',
  payslipTitle: 'Payslip',
  payPeriod: 'Pay Period',
  baseSalary: 'Base Salary',
  overtime: 'Overtime',
  bonuses: 'Bonuses & Allowances',
  grossPay: 'Gross Pay',
  cnssDeduction: 'CNSS (4.48%)',
  irDeduction: 'Income Tax (IR)',
  amoDeduction: 'AMO (2.26%)',
  otherDeductions: 'Other Deductions',
  totalDeductions: 'Total Deductions',
  netPay: 'Net Pay',
  employerCharges: 'Employer Charges',
  cnssEmployer: 'Employer CNSS (8.98%)',
  amoEmployer: 'Employer AMO (4.11%)',
  taxeProfessionnelle: 'Professional Training Tax (1.6%)',
  workDays: 'Work Days',
  paidLeave: 'Paid Leave',
  sickLeave: 'Sick Leave',
  earnings: 'EARNINGS',
  deductions: 'DEDUCTIONS',

  missionOrder: 'MISSION ORDER',
  missionOrderTitle: 'Mission Order',
  missionRef: 'Mission Ref.',
  assignedTo: 'Assigned to',
  destination: 'Destination',
  departureDate: 'Departure Date',
  returnDate: 'Return Date',
  missionPurpose: 'Mission Purpose',
  transportMode: 'Transport Mode',
  accommodation: 'Accommodation',
  estimatedBudget: 'Estimated Budget',
  approvalStatus: 'Approval Status',
  approved: 'Approved',
  pending: 'Pending',
  notes: 'Notes',
  transportModes: {
    car: 'Car',
    train: 'Train',
    plane: 'Plane',
    bus: 'Bus',
    other: 'Other',
  },
  employeeInfo: 'EMPLOYEE INFORMATION',
  missionDetails: 'MISSION DETAILS',
};

const AR: RHTranslations = {
  company: 'الشركة',
  date: 'التاريخ',
  signature: 'التوقيع',
  stampAndSignature: 'الختم والتوقيع',
  employerSignature: 'توقيع المشغل',
  employeeSignature: 'توقيع الأجير',
  page: 'صفحة',
  of: 'من',
  madeAt: 'حرر ب',
  on: 'في',

  expenseReport: 'بيان المصاريف',
  expenseRef: 'المرجع',
  employee: 'الأجير',
  department: 'القسم',
  period: 'الفترة',
  from: 'من',
  to: 'إلى',
  expenseDate: 'التاريخ',
  description: 'الوصف',
  category: 'الفئة',
  amount: 'المبلغ',
  currency: 'درهم',
  receipt: 'الوصل',
  yes: 'نعم',
  no: 'لا',
  totalExpenses: 'مجموع المصاريف',
  advanceReceived: 'التسبيق المتسلم',
  balanceDue: 'المبلغ المستحق',
  approvedBy: 'تمت الموافقة من طرف',
  categories: {
    transport: 'النقل',
    meals: 'الوجبات',
    accommodation: 'الإقامة',
    supplies: 'اللوازم',
    communication: 'الاتصالات',
    other: 'أخرى',
  },

  workCertificate: 'شهادة العمل',
  workCertificateTitle: 'شهادة العمل',
  certifyThat: 'نحن الموقعون أدناه، لو تاتش بوا ش.ذ.م.م ذات الشريك الوحيد، نشهد بموجب هذا أن:',
  bornOn: 'المولود(ة) بتاريخ',
  at: 'ب',
  cinNumber: 'حامل(ة) بطاقة التعريف الوطنية رقم',
  employedSince: 'يعمل/تعمل بشركتنا منذ',
  asPosition: 'بصفة',
  inDepartment: 'بقسم',
  certificateIssued: 'سلمت هذه الشهادة للمعني(ة) بالأمر لتقديمها عند الحاجة.',
  forWhateverPurpose: 'لتقديمها عند الحاجة.',
  currentlyEmployed: 'المعني(ة) بالأمر لا يزال(تزال) في الخدمة حتى الآن.',
  leftCompanyOn: 'غادر(ت) المعني(ة) بالأمر شركتنا بتاريخ',

  salaryCertificate: 'شهادة الأجر',
  salaryCertificateTitle: 'شهادة الأجر',
  monthlySalary: 'يتقاضى/تتقاضى أجرا شهريا قدره',
  grossSalary: 'الأجر الإجمالي',
  netSalary: 'الأجر الصافي',
  cnssNumber: 'رقم الصندوق الوطني للضمان الاجتماعي',
  salaryInWords: 'أوقفت هذه الشهادة على مبلغ',

  payslip: 'بيان الأجر',
  payslipTitle: 'بيان الأجر',
  payPeriod: 'فترة الأداء',
  baseSalary: 'الأجر الأساسي',
  overtime: 'الساعات الإضافية',
  bonuses: 'التعويضات والمنح',
  grossPay: 'الأجر الإجمالي',
  cnssDeduction: 'الصندوق الوطني للضمان الاجتماعي (4,48%)',
  irDeduction: 'الضريبة على الدخل',
  amoDeduction: 'التأمين الإجباري عن المرض (2,26%)',
  otherDeductions: 'اقتطاعات أخرى',
  totalDeductions: 'مجموع الاقتطاعات',
  netPay: 'الصافي للأداء',
  employerCharges: 'تحملات المشغل',
  cnssEmployer: 'حصة المشغل من الضمان الاجتماعي (8,98%)',
  amoEmployer: 'حصة المشغل من التأمين عن المرض (4,11%)',
  taxeProfessionnelle: 'رسم التكوين المهني (1,6%)',
  workDays: 'أيام العمل',
  paidLeave: 'العطل المؤدى عنها',
  sickLeave: 'العطل المرضية',
  earnings: 'المستحقات',
  deductions: 'الاقتطاعات',

  missionOrder: 'أمر بالمهمة',
  missionOrderTitle: 'أمر بالمهمة',
  missionRef: 'مرجع المهمة',
  assignedTo: 'مسند إلى',
  destination: 'الوجهة',
  departureDate: 'تاريخ المغادرة',
  returnDate: 'تاريخ العودة',
  missionPurpose: 'موضوع المهمة',
  transportMode: 'وسيلة النقل',
  accommodation: 'الإقامة',
  estimatedBudget: 'الميزانية التقديرية',
  approvalStatus: 'حالة الموافقة',
  approved: 'موافق عليه',
  pending: 'في انتظار الموافقة',
  notes: 'ملاحظات',
  transportModes: {
    car: 'سيارة',
    train: 'قطار',
    plane: 'طائرة',
    bus: 'حافلة',
    other: 'أخرى',
  },
  employeeInfo: 'معلومات الأجير',
  missionDetails: 'تفاصيل المهمة',
};

const ES: RHTranslations = {
  company: 'Empresa',
  date: 'Fecha',
  signature: 'Firma',
  stampAndSignature: 'Sello y Firma',
  employerSignature: 'Firma del Empleador',
  employeeSignature: 'Firma del Empleado',
  page: 'Página',
  of: 'de',
  madeAt: 'Hecho en',
  on: 'El',

  expenseReport: 'NOTA DE GASTOS',
  expenseRef: 'Ref.',
  employee: 'Empleado',
  department: 'Departamento',
  period: 'Período',
  from: 'Desde',
  to: 'Hasta',
  expenseDate: 'Fecha',
  description: 'Descripción',
  category: 'Categoría',
  amount: 'Importe',
  currency: 'MAD',
  receipt: 'Justificante',
  yes: 'Sí',
  no: 'No',
  totalExpenses: 'Total gastos',
  advanceReceived: 'Anticipo recibido',
  balanceDue: 'Saldo a reembolsar',
  approvedBy: 'Aprobado por',
  categories: {
    transport: 'Transporte',
    meals: 'Comidas',
    accommodation: 'Alojamiento',
    supplies: 'Suministros',
    communication: 'Comunicación',
    other: 'Otros',
  },

  workCertificate: 'CERTIFICADO DE TRABAJO',
  workCertificateTitle: 'Certificado de Trabajo',
  certifyThat: 'Los abajo firmantes, LE TATCHE BOIS S.A.R.L.A.U, certificamos que:',
  bornOn: 'Nacido/a el',
  at: 'en',
  cinNumber: 'DNI n°',
  employedSince: 'trabaja en nuestra empresa desde el',
  asPosition: 'como',
  inDepartment: 'en el departamento de',
  certificateIssued: 'Se expide el presente certificado al interesado/a para los fines que estime oportunos.',
  forWhateverPurpose: 'para los fines que estime oportunos.',
  currentlyEmployed: 'El/La interesado/a sigue actualmente en activo.',
  leftCompanyOn: 'El/La interesado/a dejó nuestra empresa el',

  salaryCertificate: 'CERTIFICADO DE SALARIO',
  salaryCertificateTitle: 'Certificado de Salario',
  monthlySalary: 'percibe un salario mensual de',
  grossSalary: 'Salario bruto',
  netSalary: 'Salario neto',
  cnssNumber: 'N° CNSS',
  salaryInWords: 'Se expide el presente certificado por el importe de',

  payslip: 'NÓMINA',
  payslipTitle: 'Nómina',
  payPeriod: 'Período de pago',
  baseSalary: 'Salario base',
  overtime: 'Horas extras',
  bonuses: 'Primas e indemnizaciones',
  grossPay: 'Salario bruto',
  cnssDeduction: 'CNSS (4,48%)',
  irDeduction: 'IRPF',
  amoDeduction: 'AMO (2,26%)',
  otherDeductions: 'Otras deducciones',
  totalDeductions: 'Total deducciones',
  netPay: 'Neto a pagar',
  employerCharges: 'Cargas patronales',
  cnssEmployer: 'CNSS patronal (8,98%)',
  amoEmployer: 'AMO patronal (4,11%)',
  taxeProfessionnelle: 'Tasa formación prof. (1,6%)',
  workDays: 'Días trabajados',
  paidLeave: 'Vacaciones',
  sickLeave: 'Baja por enfermedad',
  earnings: 'INGRESOS',
  deductions: 'DEDUCCIONES',

  missionOrder: 'ORDEN DE MISIÓN',
  missionOrderTitle: 'Orden de Misión',
  missionRef: 'Ref. Misión',
  assignedTo: 'Asignado a',
  destination: 'Destino',
  departureDate: 'Fecha de salida',
  returnDate: 'Fecha de regreso',
  missionPurpose: 'Objeto de la misión',
  transportMode: 'Medio de transporte',
  accommodation: 'Alojamiento',
  estimatedBudget: 'Presupuesto estimado',
  approvalStatus: 'Estado de aprobación',
  approved: 'Aprobado',
  pending: 'Pendiente',
  notes: 'Observaciones',
  transportModes: {
    car: 'Coche',
    train: 'Tren',
    plane: 'Avión',
    bus: 'Autobús',
    other: 'Otro',
  },
  employeeInfo: 'INFORMACIÓN DEL EMPLEADO',
  missionDetails: 'DETALLES DE LA MISIÓN',
};

const translations: Record<RHLanguage, RHTranslations> = { fr: FR, en: EN, ar: AR, es: ES };

export function getRHTranslations(lang: RHLanguage): RHTranslations {
  return translations[lang] || translations.fr;
}
