import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GuardianAI Pro API',
      version: '1.0.0',
      description: `Predictive Multimodal Personal Safety Ecosystem API

## Features
- **User Management**: Registration, authentication, role-based access
- **Worker Management**: Profiles, certifications, attendance, shifts
- **Factory Hierarchy**: Factories, buildings, floors, zones
- **Device Management**: IoT devices, firmware, calibration, telemetry
- **Sensor Network**: Sensors, readings, environmental data
- **Camera System**: Surveillance, AI analytics, recording
- **Incident Management**: Reporting, investigation, resolution workflows
- **Alert System**: Real-time alerts, acknowledgment, auto-resolve
- **Notifications**: Push, SMS, email, in-app delivery
- **Risk Prediction**: ML-based risk scoring, temporal trends, anomaly detection
- **Emergency Response**: Multi-channel dispatch, evacuation, incident linking
- **Equipment Health**: Predictive maintenance, anomaly monitoring
- **Compliance**: Regulatory compliance tracking, certifications, audits
- **Analytics & Reports**: Aggregate pipelines, trend analysis, PDF/Excel/CSV export
- **Live Monitoring**: Socket.IO real-time dashboards
- **Audit Logging**: Full audit trail for all operations
- **Background Jobs**: BullMQ queues for async processing
- **Caching**: Redis cache-aside with configurable TTL
`,
      contact: { name: 'GuardianAI Team' },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            stack: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'supervisor', 'safety_officer', 'worker'] },
            department: { type: 'string' },
            employeeId: { type: 'string' },
            isActive: { type: 'boolean' },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Worker: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            employeeId: { type: 'string' },
            phone: { type: 'string' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            dateOfBirth: { type: 'string', format: 'date' },
            department: { type: 'string' },
            designation: { type: 'string' },
            isActive: { type: 'boolean' },
            assignedDevices: { type: 'array', items: { type: 'string' } },
            certifications: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Device: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            serialNumber: { type: 'string' },
            type: { type: 'string', enum: ['esp32', 'raspberry_pi', 'jetson_nano', 'camera', 'smart_helmet', 'wearable', 'gateway'] },
            status: { type: 'string', enum: ['online', 'offline', 'maintenance', 'error', 'deploying'] },
            batteryLevel: { type: 'integer' },
            zone: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
        Incident: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['hazard', 'near_miss', 'safety_violation', 'equipment_failure', 'environmental'] },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            status: { type: 'string', enum: ['reported', 'investigating', 'resolved', 'closed'] },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
            reportedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Factory: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            address: { type: 'object' },
            contactPhone: { type: 'string' },
            contactEmail: { type: 'string' },
            timezone: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Building: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            factory: { type: 'string' },
            totalFloors: { type: 'integer' },
            hasBasement: { type: 'boolean' },
            isActive: { type: 'boolean' },
          },
        },
        Zone: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            type: { type: 'string', enum: ['general', 'restricted', 'evacuation_route', 'safe_zone', 'hazardous', 'storage'] },
            floor: { type: 'string' },
            building: { type: 'string' },
            factory: { type: 'string' },
            capacity: { type: 'integer' },
            currentOccupancy: { type: 'integer' },
            isActive: { type: 'boolean' },
          },
        },
        Sensor: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            sensorId: { type: 'string' },
            type: { type: 'string', enum: ['temperature', 'humidity', 'gas', 'motion', 'vibration', 'sound', 'light', 'radiation', 'pressure', 'flow', 'level', 'proximity', 'smoke', 'flame', 'current', 'voltage', 'power'] },
            status: { type: 'string', enum: ['active', 'inactive', 'error', 'calibrating'] },
            device: { type: 'string' },
            unit: { type: 'string' },
            minRange: { type: 'number' },
            maxRange: { type: 'number' },
            samplingRate: { type: 'number' },
            isActive: { type: 'boolean' },
          },
        },
        SensorReading: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sensor: { type: 'string' },
            device: { type: 'string' },
            type: { type: 'string' },
            value: { type: 'number' },
            unit: { type: 'string' },
            quality: { type: 'number' },
            recordedAt: { type: 'string', format: 'date-time' },
          },
        },
        Camera: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            cameraId: { type: 'string' },
            streamUrl: { type: 'string' },
            status: { type: 'string', enum: ['online', 'offline', 'error', 'recording', 'maintenance'] },
            fieldOfView: { type: 'number' },
            resolution: { type: 'string' },
            fps: { type: 'number' },
            nightVision: { type: 'boolean' },
            aiEnabled: { type: 'boolean' },
            recordingEnabled: { type: 'boolean' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            severity: { type: 'string' },
            source: { type: 'string' },
            acknowledged: { type: 'boolean' },
            resolved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['push', 'sms', 'email', 'in_app'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            delivered: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['compliance', 'incident', 'audit', 'performance', 'safety', 'maintenance', 'environmental'] },
            format: { type: 'string', enum: ['pdf', 'excel', 'csv'] },
            status: { type: 'string', enum: ['generating', 'completed', 'failed'] },
            dateRange: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' },
              },
            },
            downloadCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RiskPrediction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            worker: { type: 'string' },
            zone: { type: 'string' },
            predictedRiskLevel: { type: 'string', enum: ['safe', 'warning', 'high_risk', 'critical'] },
            predictedRiskScore: { type: 'number' },
            confidence: { type: 'number' },
            timeHorizon: { type: 'string' },
            modelVersion: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WearableVitals: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            worker: { type: 'string' },
            heartRate: { type: 'number' },
            spo2: { type: 'number' },
            temperature: { type: 'number' },
            stressLevel: { type: 'number' },
            fallDetected: { type: 'boolean' },
            posture: { type: 'string' },
            recordedAt: { type: 'string', format: 'date-time' },
          },
        },
        EnvironmentalData: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            zone: { type: 'string' },
            temperature: { type: 'number' },
            humidity: { type: 'number' },
            airQualityIndex: { type: 'number' },
            noiseLevel: { type: 'number' },
            radiation: { type: 'number' },
            recordedAt: { type: 'string', format: 'date-time' },
          },
        },
        EquipmentHealth: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            device: { type: 'string' },
            healthScore: { type: 'number' },
            riskLevel: { type: 'string' },
            anomalyScore: { type: 'number' },
            maintenanceDue: { type: 'boolean' },
            predictedFailureProbability: { type: 'number' },
            status: { type: 'string', enum: ['healthy', 'warning', 'critical', 'offline'] },
            recordedAt: { type: 'string', format: 'date-time' },
          },
        },
        ComplianceRecords: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            worker: { type: 'string' },
            type: { type: 'string' },
            category: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string', enum: ['compliant', 'non_compliant', 'partial', 'not_assessed'] },
            score: { type: 'number' },
            assessmentDate: { type: 'string', format: 'date' },
            isOverdue: { type: 'boolean' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            action: { type: 'string' },
            resource: { type: 'string' },
            resourceId: { type: 'string' },
            description: { type: 'string' },
            ipAddress: { type: 'string' },
            success: { type: 'boolean' },
            duration: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        EmergencyEvent: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['fire', 'chemical_spill', 'structural_failure', 'worker_injury', 'gas_leak', 'equipment_malfunction', 'intrusion', 'natural_disaster', 'power_outage', 'medical_emergency'] },
            severity: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['active', 'acknowledged', 'evacuating', 'contained', 'resolved'] },
            requiresEvacuation: { type: 'boolean' },
            affectedWorkers: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Workers', description: 'Worker profiles, attendance, certifications, shifts' },
      { name: 'Devices', description: 'IoT device management, firmware, calibration' },
      { name: 'Incidents', description: 'Incident reporting and management' },
      { name: 'Factories', description: 'Factory hierarchy: buildings, floors, zones, departments' },
      { name: 'Monitor', description: 'Live monitoring dashboard, sensor ingestion, fusion' },
      { name: 'Analytics', description: 'Analytics dashboards and report generation' },
      { name: 'Sensors', description: 'Sensor management and readings' },
      { name: 'Cameras', description: 'Camera system management' },
      { name: 'Alerts', description: 'Alert management and acknowledgment' },
      { name: 'Notifications', description: 'User notification management' },
      { name: 'Reports', description: 'Report generation and history' },
      { name: 'Equipment Health', description: 'Predictive maintenance monitoring' },
      { name: 'Compliance', description: 'Compliance tracking and audits' },
      { name: 'Emergency Events', description: 'Emergency response management' },
      { name: 'Audit Logs', description: 'Audit trail and activity logs' },
    ],
  },
  apis: ['./src/routes/v1/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
