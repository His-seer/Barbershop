export type Barber = {
    id: string;
    name: string;
    role: string;
    initials: string;
    experience: string;
    specialty: string;
};

export const BARBERS: Barber[] = [
    {
        id: "emmanuel-darko",
        name: "Emmanuel Darko",
        role: "Master Barber & Founder",
        initials: "ED",
        experience: "12+ Years",
        specialty: "Classic & Modern Fades"
    },
    {
        id: "samuel-osei",
        name: "Samuel Osei",
        role: "Senior Barber",
        initials: "SO",
        experience: "8+ Years",
        specialty: "Beard Sculpting & Design"
    },
    {
        id: "kwabena-agyei",
        name: "Kwabena Agyei",
        role: "Creative Stylist",
        initials: "KA",
        experience: "6+ Years",
        specialty: "Artistic Hair Designs"
    }
];
