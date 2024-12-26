import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { auth, db } from "../firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";
import PetHealthAssessment from "./PetHealthAssessment";

const PetHealthJournal = () => {
  const [userId, setUserId] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedPet, setSelectedPet] = useState("All");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchJournalEntries(user.uid);
      } else {
        setUserId(null);
        setJournalEntries([]);
        setChartData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchJournalEntries = async (userId) => {
    try {
      const q = query(
        collection(db, "petHealthSurveys"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setJournalEntries(entries);
      prepareChartData(entries);
    } catch (error) {
      console.error("Error fetching journal entries: ", error);
    }
  };

  const prepareChartData = (entries) => {
    const petData = {};
    entries.forEach((entry) => {
      if (!petData[entry.petName]) {
        petData[entry.petName] = [];
      }
      petData[entry.petName].push({
        date: entry.timestamp?.toDate?.() ? entry.timestamp.toDate().toLocaleDateString() : "Unknown",
        urgencyScore: entry.result.urgencyScore,
      });
    });

    const mergedData = [];
    Object.entries(petData).forEach(([petName, data]) => {
      data.forEach((item, index) => {
        if (!mergedData[index]) mergedData[index] = { date: item.date };
        mergedData[index][petName] = item.urgencyScore;
      });
    });

    setChartData(mergedData);
  };

  const filteredEntries =
  selectedPet === "All"
    ? journalEntries
    : journalEntries.filter((entry) => entry.petName === selectedPet);

  if (showAssessment) {
    return <PetHealthAssessment onClose={() => setShowAssessment(false)} />;
  }

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header as="h3" className="">
        <h3 className="card-title text-primary fw-bold mt-2">Pet Health Journal          
        </h3>
        <Button 
            variant="primary"
            className=""
            onClick={() => setShowAssessment(true)}
          >
            Add New Assessment
          </Button>
        </Card.Header>
        <Card.Body>
          {journalEntries.length === 0 ? (
            <p className="text-center">No journal entries found.</p>
          ) : (
            <>
              <Row className="mb-4">
                <Col>
                  <h4>Pet Health Assesment History</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: "Urgency Score", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Legend />
                      {Object.keys(chartData[0] || {})
                        .filter((key) => key !== "date")
                        .map((petName, index) => (
                          <Line
                            key={petName}
                            type="monotone"
                            dataKey={petName}
                            name={petName}
                            stroke={`hsl(${index * 60}, 70%, 50%)`}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Col>
              </Row>

<Row className="mb-3">
<p class="text-muted fs-5">
  If the urgency score is 8 or higher, the recommendation is: 
  <span class="text-danger fw-bold"> Critical</span> for immediate veterinary care. 
  If the score is 5 or higher, it is 
  <span class="text-warning fw-bold"> Urgent</span> to schedule a veterinary consultation soon. 
  If the score is 3 or higher, the recommendation is 
  <span class="text-primary fw-bold"> Moderate</span> to monitor closely and consider a vet check. 
  If the score is below 3, it is 
  <span class="text-success fw-bold"> Low Risk</span>, and regular monitoring should continue.
</p>

</Row>

<Row>
  <Col>
    <h4>Detailed Entries</h4>
    <Col>
    <select
      className="form-select mb-3"
      value={selectedPet}
      onChange={(e) => setSelectedPet(e.target.value)}
    >
      <option value="All">All Pets</option>
      {Array.from(new Set(journalEntries.map((entry) => entry.petName))).map((petName) => (
        <option key={petName} value={petName}>
          {petName}
        </option>
      ))}
    </select>
  </Col>
    {filteredEntries.map((entry) => {
      const colorClass = entry.result.recommendation.includes("CRITICAL")
        ? "bg-danger text-white"
        : entry.result.recommendation.includes("URGENT")
        ? "bg-warning"
        : entry.result.recommendation.includes("MODERATE")
        ? "bg-info text-white"
        : "bg-success text-white";

      return (
        <Card key={entry.id} className={`mb-3 ${colorClass}`}>
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h5>
                  {entry.petName} ({entry.petType}) - {entry.result.recommendation}
                </h5>
                <p>
                  Age: {entry.petAge} months
                  <br />
                  Urgency Score: {entry.result.urgencyScore}
                  <br />
                  Date: {entry.timestamp?.toDate?.() ? entry.timestamp.toDate().toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      );
    })}
  </Col>
</Row>


            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PetHealthJournal;
