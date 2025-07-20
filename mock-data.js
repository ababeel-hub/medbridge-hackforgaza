/**
 * Mock Data for MedBridge Gaza
 * Based on the wireframes and real-world medical scenarios
 */

// User Types and Roles
const USER_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external'
};

// Case Statuses
const CASE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed',
  CLOSED: 'closed'
};

// Medical Specialties
const SPECIALTIES = [
  'Cardiology',
  'Orthopedics', 
  'Emergency Medicine',
  'Pediatrics',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Urology',
  'Oncology'
];

// Age Ranges
const AGE_RANGES = [
  '0-5 years',
  '6-12 years', 
  '13-17 years',
  '18-30 years',
  '31-50 years',
  '51+ years'
];

// Mock Users (Internal Doctors in Gaza)
const INTERNAL_DOCTORS = [
  {
    uid: 'internal_001',
    email: 'ahmad.mohammed@al-shifa.ps',
    displayName: 'Dr. Ahmad Mohammed',
    userType: USER_TYPES.INTERNAL,
    specialty: 'Emergency Medicine',
    hospital: 'Al-Shifa Hospital',
    location: 'Gaza City',
    experience: '8 years',
    phone: '+970-59-123-4567',
    isVerified: true,
    createdAt: new Date('2024-01-15'),
    lastActive: new Date()
  },
  {
    uid: 'internal_002', 
    email: 'fatima.ali@european.ps',
    displayName: 'Dr. Fatima Ali',
    userType: USER_TYPES.INTERNAL,
    specialty: 'Pediatrics',
    hospital: 'European Gaza Hospital',
    location: 'Khan Yunis',
    experience: '12 years',
    phone: '+970-59-234-5678',
    isVerified: true,
    createdAt: new Date('2024-01-10'),
    lastActive: new Date()
  },
  {
    uid: 'internal_003',
    email: 'omar.hassan@nasser.ps', 
    displayName: 'Dr. Omar Hassan',
    userType: USER_TYPES.INTERNAL,
    specialty: 'Orthopedics',
    hospital: 'Nasser Medical Complex',
    location: 'Khan Yunis',
    experience: '15 years',
    phone: '+970-59-345-6789',
    isVerified: true,
    createdAt: new Date('2024-01-05'),
    lastActive: new Date()
  },
  {
    uid: 'internal_004',
    email: 'lina.abed@indonesia.ps',
    displayName: 'Dr. Lina Abed',
    userType: USER_TYPES.INTERNAL,
    specialty: 'Cardiology',
    hospital: 'Indonesia Hospital',
    location: 'Jabalia',
    experience: '10 years',
    phone: '+970-59-456-7890',
    isVerified: true,
    createdAt: new Date('2024-01-12'),
    lastActive: new Date()
  },
  {
    uid: 'internal_005',
    email: 'youssef.nasser@kamal.ps',
    displayName: 'Dr. Youssef Nasser',
    userType: USER_TYPES.INTERNAL,
    specialty: 'General Surgery',
    hospital: 'Kamal Adwan Hospital',
    location: 'Beit Lahia',
    experience: '18 years',
    phone: '+970-59-567-8901',
    isVerified: true,
    createdAt: new Date('2024-01-08'),
    lastActive: new Date()
  }
];

// Mock Users (External Doctors - International Experts)
const EXTERNAL_DOCTORS = [
  {
    uid: 'external_001',
    email: 'sarah.klein@mayo.edu',
    displayName: 'Dr. Sarah Klein',
    userType: USER_TYPES.EXTERNAL,
    specialty: 'Cardiology',
    hospital: 'Mayo Clinic',
    location: 'Rochester, MN, USA',
    experience: '20 years',
    phone: '+1-507-284-1234',
    isVerified: true,
    credentials: ['MD', 'FACC', 'FSCAI'],
    createdAt: new Date('2024-01-01'),
    lastActive: new Date()
  },
  {
    uid: 'external_002',
    email: 'james.lewis@ucl.ac.uk',
    displayName: 'Dr. James Lewis',
    userType: USER_TYPES.EXTERNAL,
    specialty: 'Emergency Medicine',
    hospital: 'University College London Hospital',
    location: 'London, UK',
    experience: '16 years',
    phone: '+44-20-3456-7890',
    isVerified: true,
    credentials: ['MBBS', 'FRCP', 'FACEM'],
    createdAt: new Date('2024-01-02'),
    lastActive: new Date()
  },
  {
    uid: 'external_003',
    email: 'maria.garcia@hopital-paris.fr',
    displayName: 'Dr. Maria Garcia',
    userType: USER_TYPES.EXTERNAL,
    specialty: 'Pediatrics',
    hospital: 'Hôpital Necker-Enfants Malades',
    location: 'Paris, France',
    experience: '14 years',
    phone: '+33-1-44-49-4000',
    isVerified: true,
    credentials: ['MD', 'PhD'],
    createdAt: new Date('2024-01-03'),
    lastActive: new Date()
  },
  {
    uid: 'external_004',
    email: 'ahmed.ibrahim@kfshrc.edu.sa',
    displayName: 'Dr. Ahmed Ibrahim',
    userType: USER_TYPES.EXTERNAL,
    specialty: 'Orthopedics',
    hospital: 'King Faisal Specialist Hospital',
    location: 'Riyadh, Saudi Arabia',
    experience: '22 years',
    phone: '+966-11-442-7000',
    isVerified: true,
    credentials: ['MBBS', 'FRCS', 'FACS'],
    createdAt: new Date('2024-01-04'),
    lastActive: new Date()
  },
  {
    uid: 'external_005',
    email: 'anna.petrov@charite.de',
    displayName: 'Dr. Anna Petrov',
    userType: USER_TYPES.EXTERNAL,
    specialty: 'Neurology',
    hospital: 'Charité University Hospital',
    location: 'Berlin, Germany',
    experience: '19 years',
    phone: '+49-30-450-50',
    isVerified: true,
    credentials: ['MD', 'PhD', 'FEAN'],
    createdAt: new Date('2024-01-05'),
    lastActive: new Date()
  }
];

// Mock Medical Cases
const MEDICAL_CASES = [
  {
    id: 'case_001',
    title: 'Acute Chest Pain - 45yr Male',
    createdBy: 'internal_001',
    assignedTo: 'external_001',
    status: CASE_STATUS.IN_REVIEW,
    specialty: 'Cardiology',
    patientAge: '45-50 years',
    patientGender: 'Male',
    symptoms: `Patient presented with acute chest pain that started 2 hours ago during physical exertion. 
    Pain is retrosternal, radiating to left arm and jaw. Associated with diaphoresis and shortness of breath. 
    Pain intensity 8/10, crushing in nature. No relief with rest or nitroglycerin.`,
    medicalHistory: `Previous hypertension (diagnosed 3 years ago), family history of cardiac disease (father had MI at age 50). 
    No previous cardiac events. Current medications: Amlodipine 5mg daily. No known drug allergies.`,
    vitalSigns: {
      bloodPressure: '160/95 mmHg',
      heartRate: '110 bpm',
      temperature: '37.2°C',
      oxygenSaturation: '94%'
    },
    labResults: {
      troponin: '0.15 ng/mL (elevated)',
      ck: '450 U/L',
      ck_mb: '25 ng/mL'
    },
    ecg: 'ST elevation in leads II, III, aVF, V5-V6',
    treatmentGiven: 'Aspirin 325mg, Nitroglycerin SL, Morphine 4mg IV',
    tags: ['cardiology', 'chest-pain', 'acute', 'emergency'],
    priority: 'high',
    createdAt: new Date('2024-01-20T10:30:00Z'),
    updatedAt: new Date('2024-01-22T14:15:00Z'),
    researchConsent: true
  },
  {
    id: 'case_002',
    title: 'Compound Fracture - 30yr Female',
    createdBy: 'internal_003',
    assignedTo: 'external_004',
    status: CASE_STATUS.COMPLETED,
    specialty: 'Orthopedics',
    patientAge: '30-35 years',
    patientGender: 'Female',
    symptoms: `Patient sustained injury during recent conflict. Open fracture of right tibia and fibula. 
    Bone protruding through skin, significant soft tissue damage. Patient reports severe pain and inability to bear weight.`,
    medicalHistory: `No significant medical history. No previous fractures or surgeries. No known allergies.`,
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: '95 bpm',
      temperature: '37.8°C',
      oxygenSaturation: '98%'
    },
    imaging: 'X-ray shows comminuted fracture of distal third tibia and fibula with soft tissue injury',
    treatmentGiven: 'IV antibiotics (Cefazolin), Tetanus prophylaxis, Splinting, Pain management',
    tags: ['orthopedics', 'fracture', 'trauma', 'open-fracture'],
    priority: 'high',
    createdAt: new Date('2024-01-18T08:45:00Z'),
    updatedAt: new Date('2024-01-21T16:30:00Z'),
    researchConsent: true
  },
  {
    id: 'case_003',
    title: 'Pediatric Respiratory Distress - 3yr Male',
    createdBy: 'internal_002',
    assignedTo: 'external_003',
    status: CASE_STATUS.IN_REVIEW,
    specialty: 'Pediatrics',
    patientAge: '3-4 years',
    patientGender: 'Male',
    symptoms: `3-year-old child presenting with respiratory distress for 2 days. 
    Rapid breathing, wheezing, chest retractions. Cough is dry and non-productive. 
    Child appears anxious and using accessory muscles for breathing.`,
    medicalHistory: `Previous history of asthma (diagnosed at age 2). 
    No recent travel or sick contacts. Immunizations up to date.`,
    vitalSigns: {
      bloodPressure: '85/50 mmHg',
      heartRate: '140 bpm',
      temperature: '38.2°C',
      oxygenSaturation: '88%',
      respiratoryRate: '45/min'
    },
    physicalExam: 'Wheezing bilaterally, prolonged expiratory phase, intercostal retractions',
    treatmentGiven: 'Albuterol nebulizer, Oxygen therapy, IV fluids',
    tags: ['pediatrics', 'respiratory', 'asthma', 'emergency'],
    priority: 'high',
    createdAt: new Date('2024-01-22T12:00:00Z'),
    updatedAt: new Date('2024-01-22T15:45:00Z'),
    researchConsent: true
  },
  {
    id: 'case_004',
    title: 'Severe Headache - 28yr Female',
    createdBy: 'internal_001',
    assignedTo: null,
    status: CASE_STATUS.SUBMITTED,
    specialty: 'Emergency Medicine',
    patientAge: '28-30 years',
    patientGender: 'Female',
    symptoms: `Sudden onset severe headache described as "worst headache of my life". 
    Pain is global, throbbing, and associated with photophobia and phonophobia. 
    No fever, no neck stiffness. Onset was 4 hours ago.`,
    medicalHistory: `No previous headaches. No family history of migraines or aneurysms. 
    No recent head trauma. No medications.`,
    vitalSigns: {
      bloodPressure: '140/90 mmHg',
      heartRate: '88 bpm',
      temperature: '36.8°C',
      oxygenSaturation: '99%'
    },
    neurologicalExam: 'Alert and oriented, cranial nerves intact, motor and sensory normal',
    treatmentGiven: 'Pain management with Paracetamol, Dark room, IV fluids',
    tags: ['emergency', 'headache', 'neurological', 'acute'],
    priority: 'medium',
    createdAt: new Date('2024-01-22T09:15:00Z'),
    updatedAt: new Date('2024-01-22T09:15:00Z'),
    researchConsent: false
  },
  {
    id: 'case_005',
    title: 'Joint Pain - 55yr Male',
    createdBy: 'internal_003',
    assignedTo: 'external_004',
    status: CASE_STATUS.IN_REVIEW,
    specialty: 'Orthopedics',
    patientAge: '55-60 years',
    patientGender: 'Male',
    symptoms: `Chronic knee pain for 6 months, worsening over past 2 weeks. 
    Pain is worse with weight bearing and climbing stairs. 
    Morning stiffness lasting 30 minutes. No recent trauma.`,
    medicalHistory: `Type 2 diabetes (10 years), hypertension. 
    Previous knee injury 15 years ago. Current medications: Metformin, Amlodipine.`,
    vitalSigns: {
      bloodPressure: '145/90 mmHg',
      heartRate: '72 bpm',
      temperature: '36.9°C',
      oxygenSaturation: '97%'
    },
    physicalExam: 'Tenderness over medial joint line, limited range of motion, crepitus',
    imaging: 'X-ray shows joint space narrowing and osteophytes',
    treatmentGiven: 'NSAIDs, Physical therapy referral, Weight management counseling',
    tags: ['orthopedics', 'joint-pain', 'chronic', 'osteoarthritis'],
    priority: 'medium',
    createdAt: new Date('2024-01-19T14:20:00Z'),
    updatedAt: new Date('2024-01-21T11:30:00Z'),
    researchConsent: true
  },
  {
    id: 'case_006',
    title: 'Abdominal Pain - 40yr Female',
    createdBy: 'internal_005',
    assignedTo: null,
    status: CASE_STATUS.DRAFT,
    specialty: 'General Surgery',
    patientAge: '40-45 years',
    patientGender: 'Female',
    symptoms: `Right lower quadrant pain for 24 hours. Pain started periumbilical and migrated to RLQ. 
    Associated with nausea and decreased appetite. No vomiting or diarrhea.`,
    medicalHistory: `No previous surgeries. No known medical conditions. 
    Regular menstrual cycles. No recent travel.`,
    vitalSigns: {
      bloodPressure: '125/80 mmHg',
      heartRate: '90 bpm',
      temperature: '37.5°C',
      oxygenSaturation: '98%'
    },
    physicalExam: 'Tenderness in RLQ, positive McBurney\'s point, rebound tenderness',
    labResults: {
      wbc: '15,000/μL',
      neutrophils: '85%'
    },
    treatmentGiven: 'IV fluids, Antibiotics, NPO status',
    tags: ['surgery', 'abdominal-pain', 'appendicitis', 'acute'],
    priority: 'high',
    createdAt: new Date('2024-01-22T16:00:00Z'),
    updatedAt: new Date('2024-01-22T16:00:00Z'),
    researchConsent: true
  }
];

// Mock Answers/Feedback
const ANSWERS = [
  {
    id: 'answer_001',
    caseId: 'case_001',
    createdBy: 'external_001',
    type: 'approval',
    content: `Excellent diagnosis and treatment plan. The ECG findings with ST elevation in inferior leads (II, III, aVF) and lateral leads (V5-V6) strongly support your assessment of an acute inferior-lateral myocardial infarction.

Key recommendations:
1. Consider adding troponin levels for complete cardiac workup
2. Ensure patient is on dual antiplatelet therapy (Aspirin + Clopidogrel)
3. Consider urgent cardiac catheterization if available
4. Monitor for complications including arrhythmias

Your immediate management with Aspirin, Nitroglycerin, and Morphine is appropriate. The elevated troponin confirms myocardial injury.`,
    rating: 5,
    createdAt: new Date('2024-01-22T15:30:00Z'),
    updatedAt: new Date('2024-01-22T15:30:00Z')
  },
  {
    id: 'answer_002',
    caseId: 'case_001',
    createdBy: 'external_002',
    type: 'question',
    content: `Good initial assessment. I have a few questions to help with management:

1. Did you consider stress testing for this patient?
2. What was the blood pressure reading during the acute episode?
3. Are there any facilities for cardiac catheterization in your area?
4. What's the patient's current functional status?

The ECG changes are concerning and suggest significant ischemia. Consider transfer to a facility with cardiac intervention capabilities if possible.`,
    rating: 4,
    createdAt: new Date('2024-01-21T18:45:00Z'),
    updatedAt: new Date('2024-01-21T18:45:00Z')
  },
  {
    id: 'answer_003',
    caseId: 'case_002',
    createdBy: 'external_004',
    type: 'approval',
    content: `Excellent management of this open fracture. Your approach is appropriate and follows standard protocols.

Recommendations:
1. Continue IV antibiotics for 48-72 hours
2. Consider external fixation for stabilization
3. Ensure proper wound care and monitoring for infection
4. Plan for definitive fixation once soft tissue condition improves

The Gustilo-Anderson classification appears to be Type II. Monitor closely for signs of infection or compartment syndrome.`,
    rating: 5,
    createdAt: new Date('2024-01-21T17:20:00Z'),
    updatedAt: new Date('2024-01-21T17:20:00Z')
  },
  {
    id: 'answer_004',
    caseId: 'case_003',
    createdBy: 'external_003',
    type: 'feedback',
    content: `Good recognition of pediatric respiratory distress. This appears to be an acute asthma exacerbation.

Immediate recommendations:
1. Continue albuterol every 20 minutes for first hour
2. Add systemic corticosteroids (Prednisolone 2mg/kg)
3. Consider magnesium sulfate if no improvement
4. Monitor oxygen saturation continuously

The child should show improvement within 1-2 hours. If not, consider ICU admission for continuous albuterol and monitoring.`,
    rating: 5,
    createdAt: new Date('2024-01-22T16:30:00Z'),
    updatedAt: new Date('2024-01-22T16:30:00Z')
  },
  {
    id: 'answer_005',
    caseId: 'case_005',
    createdBy: 'external_004',
    type: 'feedback',
    content: `This presentation is consistent with osteoarthritis of the knee. Your management plan is appropriate.

Additional recommendations:
1. Consider intra-articular corticosteroid injection
2. Recommend low-impact exercises (swimming, cycling)
3. Consider glucosamine/chondroitin supplements
4. Weight loss counseling is crucial

The X-ray findings confirm the diagnosis. Consider referral to physical therapy for strengthening exercises.`,
    rating: 4,
    createdAt: new Date('2024-01-21T12:15:00Z'),
    updatedAt: new Date('2024-01-21T12:15:00Z')
  }
];

// Mock Votes
const VOTES = [
  { id: 'vote_001', answerId: 'answer_001', userId: 'internal_001', value: 1, createdAt: new Date('2024-01-22T16:00:00Z') },
  { id: 'vote_002', answerId: 'answer_001', userId: 'external_002', value: 1, createdAt: new Date('2024-01-22T16:30:00Z') },
  { id: 'vote_003', answerId: 'answer_002', userId: 'internal_001', value: 1, createdAt: new Date('2024-01-21T19:00:00Z') },
  { id: 'vote_004', answerId: 'answer_003', userId: 'internal_003', value: 1, createdAt: new Date('2024-01-21T18:00:00Z') },
  { id: 'vote_005', answerId: 'answer_004', userId: 'internal_002', value: 1, createdAt: new Date('2024-01-22T17:00:00Z') }
];

// Export all mock data
const MOCK_DATA = {
  users: [...INTERNAL_DOCTORS, ...EXTERNAL_DOCTORS],
  cases: MEDICAL_CASES,
  answers: ANSWERS,
  votes: VOTES,
  constants: {
    USER_TYPES,
    CASE_STATUS,
    SPECIALTIES,
    AGE_RANGES
  }
};

// Function to populate Firestore with mock data
async function populateFirestore() {
  const { collection, addDoc, setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  
  if (!window.firebaseDb) {
    console.error('Firebase not initialized');
    return;
  }

  const db = window.firebaseDb;
  
  try {
    console.log('Starting to populate Firestore with mock data...');
    
    // Add users
    for (const user of MOCK_DATA.users) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`Added user: ${user.displayName}`);
    }
    
    // Add cases
    for (const caseData of MOCK_DATA.cases) {
      await setDoc(doc(db, 'cases', caseData.id), caseData);
      console.log(`Added case: ${caseData.title}`);
    }
    
    // Add answers
    for (const answer of MOCK_DATA.answers) {
      await setDoc(doc(db, 'answers', answer.id), answer);
      console.log(`Added answer: ${answer.id}`);
    }
    
    // Add votes
    for (const vote of MOCK_DATA.votes) {
      await setDoc(doc(db, 'votes', vote.id), vote);
      console.log(`Added vote: ${vote.id}`);
    }
    
    console.log('✅ Firestore population completed successfully!');
    
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

// Make functions available globally
window.MOCK_DATA = MOCK_DATA;
window.populateFirestore = populateFirestore; 