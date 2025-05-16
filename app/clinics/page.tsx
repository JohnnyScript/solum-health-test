"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/data-table";

type Clinic = {
  id: string;
  name: string;
  calls: number;
  avgScore: number;
};

export default function ClinicsPage() {
  const [clinicStats, setClinicStats] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true);
        const { data: clinicData } = await supabase
          .from("calls")
          .select(
            `
            clinic:clinic_id (
              id,
              name
            ),
            evaluation_score_human
          `
          )
          .not("evaluation_score_human", "is", null);

        // Process clinic data
        const stats = (clinicData || []).reduce(
          (acc: { [key: string]: Clinic }, curr: any) => {
            const clinicId = curr.clinic?.id;
            const clinicName = curr.clinic?.name;
            if (!clinicId || !clinicName) return acc;

            if (!acc[clinicId]) {
              acc[clinicId] = {
                id: clinicId,
                name: clinicName,
                calls: 0,
                avgScore: 0,
              };
            }
            acc[clinicId].calls++;
            acc[clinicId].avgScore += curr.evaluation_score_human || 0;
            return acc;
          },
          {}
        );

        const statsArray = Object.values(stats || {})
          .map((clinic) => ({
            ...clinic,
            avgScore: clinic.avgScore / clinic.calls,
          }))
          .sort((a, b) => b.avgScore - a.avgScore);

        setClinicStats(statsArray);
      } catch (error) {
        console.error("Error fetching clinic data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Clinics Performance</h1>
      <DataTable
        title="Clinic Statistics"
        data={clinicStats}
        loading={loading}
      />
    </main>
  );
}
