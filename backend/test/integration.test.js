import http from 'http';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SECURE CAMPUS PORTAL BACKEND TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  let testCreatedComplaintId = null;

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data.database === 'CONNECTED', 'Backend is healthy and connected to Supabase');

    // 2. Student Profile (Tariq Ahmad)
    const studentProfile = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/students/profile',
      method: 'GET',
      headers: {
        'x-user-email': 'student.tariq@amu.ac.in',
        'x-demo-role': 'STUDENT',
      },
    });
    assert(studentProfile.status === 200, 'Student profile fetched successfully');
    assert(studentProfile.data.data?.enrollmentNumber === 'GL1234', 'Enrollment number matches GL1234');
    assert(studentProfile.data.data?.rollNumber === '23COB042', 'Roll number matches 23COB042');
    assert(studentProfile.data.data?.course?.code === 'CS-BTECH', 'Course linked correctly to CS-BTECH');
    assert(studentProfile.data.data?.allottedHall?.code === 'SSH-N', 'Hall linked correctly to Sir Syed Hall (North)');
    assert(studentProfile.data.data?.currentSemester === 5, 'Current semester is 5 (within 8 max semesters)');

    // 3. Faculty Profile (Dr. Farhan Siddiqui)
    const facultyProfile = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/faculty/profile',
      method: 'GET',
      headers: {
        'x-user-email': 'faculty.farhan@amu.ac.in',
        'x-demo-role': 'FACULTY',
      },
    });
    assert(facultyProfile.status === 200, 'Faculty profile fetched successfully');
    assert(facultyProfile.data.data?.facultyNumber === 'FAC-CS-104', 'Faculty number matches FAC-CS-104');
    assert(facultyProfile.data.data?.department?.code === 'CS', 'Department matches Department of Computer Science');
    assert(facultyProfile.data.data?.appointmentType === 'PERMANENT', 'Appointment type is PERMANENT (resolved from admission type)');

    // 4. Catalog Endpoints
    const categories = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/catalog/categories',
      method: 'GET',
    });
    assert(categories.status === 200 && categories.data.data.length >= 6, 'Catalog service categories retrieved (>= 6 categories)');

    // 5. Segregation of Duties: IT Admin strictly barred from complaints dossier
    const itAdminComplaints = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/complaints',
      method: 'GET',
      headers: {
        'x-user-email': 'portal.admin@amu.ac.in',
        'x-demo-role': 'IT_ADMIN',
      },
    });
    assert(itAdminComplaints.status === 403, 'Segregation of duties enforced: IT Admin barred from student complaint dossiers (403 Forbidden)');

    // 6. Create Complaint & Verify Ticket Number Generation
    const newComplaint = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/complaints',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'student.tariq@amu.ac.in',
          'x-demo-role': 'STUDENT',
        },
      },
      {
        categoryId: categories.data.data[0].id,
        title: 'Wi-Fi connection latency in Block B study area',
        description: 'Internet connection experiences high packet loss during peak study hours.',
        priority: 'MEDIUM',
      }
    );
    assert(newComplaint.status === 201, 'New complaint created successfully (201 Created)');
    assert(newComplaint.data.data?.ticketNumber?.startsWith('CMP-'), 'Ticket number generated with prefix CMP-');
    testCreatedComplaintId = newComplaint.data.data?.id;

    // 7. Student Complaints Access (Scoped to Student)
    const studentComplaints = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/complaints',
      method: 'GET',
      headers: {
        'x-user-email': 'student.tariq@amu.ac.in',
        'x-demo-role': 'STUDENT',
      },
    });
    assert(studentComplaints.status === 200, 'Student can access complaints list');
    const studentList = studentComplaints.data.data || [];
    assert(studentList.length > 0, `Student has complaints retrieved (${studentList.length})`);

    // 8. Student Internal Notes Protection in Single View
    if (testCreatedComplaintId) {
      // Add status update with internal note as staff
      await request(
        {
          hostname: 'localhost',
          port: 5000,
          path: `/api/v1/complaints/${testCreatedComplaintId}/status`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': 'staff.cs@amu.ac.in',
            'x-demo-role': 'DEPT_STAFF',
          },
        },
        {
          status: 'UNDER_INVESTIGATION',
          publicRemark: 'Network engineering team inspecting access point.',
          internalNote: 'Internal check: Switch port 14 buffer overflow suspected.',
        }
      );

      const detailStudent = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1/complaints/${testCreatedComplaintId}`,
        method: 'GET',
        headers: {
          'x-user-email': 'student.tariq@amu.ac.in',
          'x-demo-role': 'STUDENT',
        },
      });
      assert(detailStudent.status === 200, 'Complaint detail accessible to student owner');
      const hasInternalNotes = detailStudent.data.data.history?.some((h) => h.internalNote !== undefined);
      assert(!hasInternalNotes, 'Privacy guarantee: Internal staff notes are stripped from student view');

      // Staff view of same complaint DOES include internal notes
      const detailStaff = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1/complaints/${testCreatedComplaintId}`,
        method: 'GET',
        headers: {
          'x-user-email': 'staff.cs@amu.ac.in',
          'x-demo-role': 'DEPT_STAFF',
        },
      });
      assert(detailStaff.status === 200, 'Complaint detail accessible to Staff');
      const staffNotesPresent = detailStaff.data.data.history?.some((h) => h.internalNote !== undefined);
      assert(staffNotesPresent, 'Staff can see internal notes for authorized case processing');
    }

    // Clean up test complaint so database remains completely clean
    if (testCreatedComplaintId) {
      const { supabase } = await import('../src/config/supabase.js');
      await supabase.from('status_history').delete().eq('complaint_id', testCreatedComplaintId);
      await supabase.from('complaints').delete().eq('id', testCreatedComplaintId);
      console.log('[CLEANUP] Test complaint cleaned up. Database remains clean.');
    }

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  }

  console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
