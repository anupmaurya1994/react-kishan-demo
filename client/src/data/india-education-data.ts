export type CollegeEntry = {
  name: string;
  university?: string;
};

export type CityData = {
  colleges: CollegeEntry[];
};

export type StateData = {
  cities: Record<string, CityData>;
};

export const indiaEducationData: Record<string, StateData> = {
  "Maharashtra": {
    cities: {
      "Mumbai": {
        colleges: [
          { name: "Institute of Chemical Technology", university: "University of Mumbai" },
          { name: "Veermata Jijabai Technological Institute (VJTI)", university: "University of Mumbai" },
          { name: "K.J. Somaiya College of Engineering", university: "University of Mumbai" },
          { name: "St. Xavier's College", university: "University of Mumbai" },
          { name: "Jai Hind College", university: "University of Mumbai" },
          { name: "Mithibai College", university: "University of Mumbai" },
          { name: "Wilson College", university: "University of Mumbai" },
          { name: "Tata Institute of Social Sciences (TISS)" },
        ]
      },
      "Pune": {
        colleges: [
          { name: "College of Engineering Pune (COEP)", university: "Savitribai Phule Pune University" },
          { name: "Symbiosis Institute of Technology", university: "Symbiosis International University" },
          { name: "Fergusson College", university: "Savitribai Phule Pune University" },
          { name: "Modern College of Arts, Science and Commerce", university: "Savitribai Phule Pune University" },
          { name: "MIT College of Engineering", university: "Savitribai Phule Pune University" },
          { name: "Bharati Vidyapeeth College of Engineering", university: "Bharati Vidyapeeth Deemed University" },
        ]
      },
      "Nagpur": {
        colleges: [
          { name: "Visvesvaraya National Institute of Technology (VNIT)" },
          { name: "Institute of Science, Nagpur", university: "Rashtrasant Tukadoji Maharaj Nagpur University" },
          { name: "Shri Ramdeobaba College of Engineering", university: "Rashtrasant Tukadoji Maharaj Nagpur University" },
          { name: "Hislop College", university: "Rashtrasant Tukadoji Maharaj Nagpur University" },
        ]
      },
      "Nashik": {
        colleges: [
          { name: "K.K. Wagh Institute of Engineering", university: "Savitribai Phule Pune University" },
          { name: "Sandip Institute of Technology", university: "Savitribai Phule Pune University" },
          { name: "HPT Arts and RYK Science College", university: "Savitribai Phule Pune University" },
        ]
      }
    }
  },
  "Delhi": {
    cities: {
      "New Delhi": {
        colleges: [
          { name: "Indian Institute of Technology Delhi (IIT Delhi)" },
          { name: "Delhi College of Engineering (DTU)" },
          { name: "Netaji Subhas University of Technology (NSUT)" },
          { name: "Lady Shri Ram College for Women", university: "University of Delhi" },
          { name: "St. Stephen's College", university: "University of Delhi" },
          { name: "Hindu College", university: "University of Delhi" },
          { name: "Miranda House", university: "University of Delhi" },
          { name: "Kirori Mal College", university: "University of Delhi" },
          { name: "Jawaharlal Nehru University (JNU)" },
        ]
      },
      "Dwarka": {
        colleges: [
          { name: "Indira Gandhi Delhi Technical University for Women" },
          { name: "Bhagwan Parshuram Institute of Technology", university: "GGSIP University" },
        ]
      },
      "Rohini": {
        colleges: [
          { name: "Maharaja Agrasen Institute of Technology", university: "GGSIP University" },
          { name: "Lal Bahadur Shastri Institute of Management" },
        ]
      }
    }
  },
  "Karnataka": {
    cities: {
      "Bengaluru": {
        colleges: [
          { name: "Indian Institute of Science (IISc)" },
          { name: "Indian Institute of Technology Bangalore (IIT Bangalore)" },
          { name: "National Institute of Technology Karnataka" },
          { name: "RV College of Engineering", university: "Visvesvaraya Technological University" },
          { name: "BMS College of Engineering", university: "Visvesvaraya Technological University" },
          { name: "PES University" },
          { name: "Christ University" },
          { name: "Bangalore University" },
          { name: "Jain University" },
        ]
      },
      "Mysuru": {
        colleges: [
          { name: "National Institute of Engineering", university: "University of Mysore" },
          { name: "JSS Science and Technology University" },
          { name: "Maharaja's College", university: "University of Mysore" },
          { name: "Yuvaraja's College", university: "University of Mysore" },
        ]
      },
      "Hubli": {
        colleges: [
          { name: "KLE Technological University" },
          { name: "Basaveshwar Engineering College", university: "Visvesvaraya Technological University" },
        ]
      }
    }
  },
  "Tamil Nadu": {
    cities: {
      "Chennai": {
        colleges: [
          { name: "Indian Institute of Technology Madras (IIT Madras)" },
          { name: "Anna University" },
          { name: "College of Engineering, Guindy", university: "Anna University" },
          { name: "Madras Christian College", university: "University of Madras" },
          { name: "Loyola College", university: "University of Madras" },
          { name: "Vellore Institute of Technology (VIT Chennai)" },
          { name: "SRM Institute of Science and Technology" },
        ]
      },
      "Coimbatore": {
        colleges: [
          { name: "PSG College of Technology", university: "Anna University" },
          { name: "Coimbatore Institute of Technology", university: "Anna University" },
          { name: "Amrita Vishwa Vidyapeetham" },
          { name: "Sri Krishna College of Engineering", university: "Anna University" },
        ]
      },
      "Madurai": {
        colleges: [
          { name: "Thiagarajar College of Engineering", university: "Anna University" },
          { name: "Madura College", university: "Madurai Kamaraj University" },
          { name: "American College", university: "Madurai Kamaraj University" },
        ]
      },
      "Vellore": {
        colleges: [
          { name: "Vellore Institute of Technology (VIT)" },
          { name: "CMC Vellore" },
        ]
      }
    }
  },
  "Uttar Pradesh": {
    cities: {
      "Lucknow": {
        colleges: [
          { name: "Indian Institute of Management Lucknow (IIM Lucknow)" },
          { name: "Lucknow University" },
          { name: "Babasaheb Bhimrao Ambedkar University" },
          { name: "Integral University" },
          { name: "Amity University Lucknow" },
        ]
      },
      "Kanpur": {
        colleges: [
          { name: "Indian Institute of Technology Kanpur (IIT Kanpur)" },
          { name: "Harcourt Butler Technical University" },
          { name: "CSJM University, Kanpur" },
          { name: "Kanpur Institute of Technology" },
        ]
      },
      "Agra": {
        colleges: [
          { name: "Dr. Bhimrao Ambedkar University, Agra" },
          { name: "St. John's College", university: "Dr. Bhimrao Ambedkar University" },
          { name: "Agra College", university: "Dr. Bhimrao Ambedkar University" },
        ]
      },
      "Varanasi": {
        colleges: [
          { name: "Indian Institute of Technology BHU" },
          { name: "Banaras Hindu University (BHU)" },
          { name: "Mahatma Gandhi Kashi Vidyapith" },
        ]
      }
    }
  },
  "Gujarat": {
    cities: {
      "Ahmedabad": {
        colleges: [
          { name: "Indian Institute of Management Ahmedabad (IIM-A)" },
          { name: "Indian Institute of Technology Gandhinagar" },
          { name: "L.D. College of Engineering", university: "Gujarat Technological University" },
          { name: "Nirma University" },
          { name: "CEPT University" },
          { name: "Gujarat University" },
        ]
      },
      "Surat": {
        colleges: [
          { name: "Sardar Vallabhbhai National Institute of Technology (SVNIT)" },
          { name: "VNSGU, Surat" },
          { name: "Government Engineering College, Surat", university: "Gujarat Technological University" },
        ]
      },
      "Vadodara": {
        colleges: [
          { name: "Maharaja Sayajirao University of Baroda" },
          { name: "Faculty of Technology and Engineering, MSU" },
        ]
      }
    }
  },
  "Rajasthan": {
    cities: {
      "Jaipur": {
        colleges: [
          { name: "Indian Institute of Technology Jodhpur" },
          { name: "Malaviya National Institute of Technology (MNIT Jaipur)" },
          { name: "University of Rajasthan" },
          { name: "Rajasthan University" },
          { name: "Amity University Rajasthan" },
          { name: "JECRC University" },
        ]
      },
      "Jodhpur": {
        colleges: [
          { name: "Indian Institute of Technology Jodhpur" },
          { name: "Jay Narain Vyas University" },
          { name: "MBM University" },
        ]
      },
      "Udaipur": {
        colleges: [
          { name: "Mohanlal Sukhadia University" },
          { name: "Mewar University" },
          { name: "Pacific University" },
        ]
      }
    }
  },
  "West Bengal": {
    cities: {
      "Kolkata": {
        colleges: [
          { name: "Indian Institute of Technology Kharagpur" },
          { name: "Jadavpur University" },
          { name: "Presidency University" },
          { name: "St. Xavier's College Kolkata", university: "Calcutta University" },
          { name: "Scottish Church College", university: "Calcutta University" },
          { name: "University of Calcutta" },
          { name: "Indian Statistical Institute" },
        ]
      },
      "Kharagpur": {
        colleges: [
          { name: "Indian Institute of Technology Kharagpur" },
          { name: "Vidyasagar University" },
        ]
      }
    }
  },
  "Telangana": {
    cities: {
      "Hyderabad": {
        colleges: [
          { name: "Indian Institute of Technology Hyderabad" },
          { name: "University of Hyderabad" },
          { name: "Osmania University" },
          { name: "JNTU Hyderabad" },
          { name: "BITS Pilani Hyderabad" },
          { name: "Chaitanya Bharati Institute of Technology", university: "JNTU Hyderabad" },
          { name: "Vasavi College of Engineering", university: "Osmania University" },
          { name: "SR Engineering College", university: "JNTU Hyderabad" },
        ]
      },
      "Warangal": {
        colleges: [
          { name: "National Institute of Technology Warangal" },
          { name: "Kakatiya University" },
        ]
      }
    }
  },
  "Madhya Pradesh": {
    cities: {
      "Bhopal": {
        colleges: [
          { name: "Indian Institute of Technology Indore" },
          { name: "Maulana Azad National Institute of Technology (MANIT)" },
          { name: "Barkatullah University, Bhopal" },
          { name: "Sagar Institute of Research & Technology" },
        ]
      },
      "Indore": {
        colleges: [
          { name: "Indian Institute of Technology Indore" },
          { name: "Indian Institute of Management Indore (IIM Indore)" },
          { name: "Devi Ahilya Vishwavidyalaya (DAVV)" },
          { name: "Acropolis Institute of Technology" },
        ]
      },
      "Jabalpur": {
        colleges: [
          { name: "Jabalpur Engineering College" },
          { name: "Rani Durgavati Vishwavidyalaya" },
        ]
      }
    }
  },
  "Punjab": {
    cities: {
      "Chandigarh": {
        colleges: [
          { name: "Punjab Engineering College (PEC)" },
          { name: "Panjab University" },
          { name: "Chandigarh University" },
          { name: "Post Graduate Institute of Medical Education and Research (PGIMER)" },
        ]
      },
      "Amritsar": {
        colleges: [
          { name: "Guru Nanak Dev University" },
          { name: "Sri Guru Ram Dass University of Health Sciences" },
        ]
      },
      "Ludhiana": {
        colleges: [
          { name: "Punjab Agricultural University" },
          { name: "CT University" },
          { name: "Christian Medical College Ludhiana" },
        ]
      }
    }
  },
  "Haryana": {
    cities: {
      "Gurugram": {
        colleges: [
          { name: "Indian School of Business (ISB)" },
          { name: "Amity University Gurugram" },
          { name: "GD Goenka University" },
          { name: "SRM University Haryana" },
        ]
      },
      "Faridabad": {
        colleges: [
          { name: "Manav Rachna International Institute of Research" },
          { name: "J.C. Bose University of Science and Technology" },
        ]
      },
      "Hisar": {
        colleges: [
          { name: "Guru Jambheshwar University of Science and Technology" },
          { name: "Chaudhary Charan Singh Haryana Agricultural University" },
        ]
      }
    }
  },
  "Kerala": {
    cities: {
      "Thiruvananthapuram": {
        colleges: [
          { name: "Indian Institute of Space Science and Technology (IIST)" },
          { name: "College of Engineering Thiruvananthapuram (CET)" },
          { name: "University of Kerala" },
          { name: "Trivandrum Medical College" },
        ]
      },
      "Kochi": {
        colleges: [
          { name: "Cochin University of Science and Technology (CUSAT)" },
          { name: "College of Engineering Thrissur", university: "APJ Abdul Kalam Technological University" },
          { name: "Rajagiri College of Social Sciences" },
        ]
      },
      "Kozhikode": {
        colleges: [
          { name: "Indian Institute of Management Kozhikode (IIM Kozhikode)" },
          { name: "National Institute of Technology Calicut (NITC)" },
          { name: "University of Calicut" },
        ]
      }
    }
  },
  "Odisha": {
    cities: {
      "Bhubaneswar": {
        colleges: [
          { name: "Indian Institute of Technology Bhubaneswar" },
          { name: "National Institute of Technology Rourkela" },
          { name: "Kalinga Institute of Industrial Technology (KIIT)" },
          { name: "Utkal University" },
          { name: "XIMB - Xavier Institute of Management" },
        ]
      },
      "Cuttack": {
        colleges: [
          { name: "Ravenshaw University" },
          { name: "SCB Medical College" },
        ]
      }
    }
  },
  "Bihar": {
    cities: {
      "Patna": {
        colleges: [
          { name: "Indian Institute of Technology Patna" },
          { name: "National Institute of Technology Patna" },
          { name: "Patna University" },
          { name: "Patna Medical College" },
          { name: "A.N. College", university: "Patna University" },
        ]
      },
      "Gaya": {
        colleges: [
          { name: "Magadh University" },
          { name: "Gaya College", university: "Magadh University" },
        ]
      }
    }
  },
  "Jharkhand": {
    cities: {
      "Ranchi": {
        colleges: [
          { name: "Indian Institute of Technology (ISM) Dhanbad" },
          { name: "National Institute of Technology Jamshedpur" },
          { name: "Ranchi University" },
          { name: "Birla Institute of Technology, Mesra" },
        ]
      },
      "Jamshedpur": {
        colleges: [
          { name: "National Institute of Technology Jamshedpur" },
          { name: "Xavier Institute of Social Service" },
        ]
      }
    }
  },
  "Assam": {
    cities: {
      "Guwahati": {
        colleges: [
          { name: "Indian Institute of Technology Guwahati" },
          { name: "Gauhati University" },
          { name: "Tezpur University" },
          { name: "Cotton University" },
        ]
      },
      "Silchar": {
        colleges: [
          { name: "National Institute of Technology Silchar" },
          { name: "Assam University" },
        ]
      }
    }
  },
  "Himachal Pradesh": {
    cities: {
      "Shimla": {
        colleges: [
          { name: "Himachal Pradesh University" },
          { name: "Indian Institute of Advanced Study (IIAS)" },
        ]
      },
      "Hamirpur": {
        colleges: [
          { name: "National Institute of Technology Hamirpur" },
          { name: "Himachal Pradesh Technical University" },
        ]
      }
    }
  },
  "Uttarakhand": {
    cities: {
      "Dehradun": {
        colleges: [
          { name: "Indian Institute of Technology Roorkee" },
          { name: "Doon University" },
          { name: "Graphic Era University" },
          { name: "Forest Research Institute University" },
        ]
      },
      "Roorkee": {
        colleges: [
          { name: "Indian Institute of Technology Roorkee" },
          { name: "Roorkee College of Engineering" },
        ]
      }
    }
  },
  "Chhattisgarh": {
    cities: {
      "Raipur": {
        colleges: [
          { name: "National Institute of Technology Raipur" },
          { name: "Pt. Ravi Shankar Shukla University" },
          { name: "Chhattisgarh Swami Vivekanand Technical University (CSVTU)" },
        ]
      },
      "Bhilai": {
        colleges: [
          { name: "Bhilai Institute of Technology" },
          { name: "CSVTU Engineering College" },
        ]
      }
    }
  },
  "Goa": {
    cities: {
      "Panaji": {
        colleges: [
          { name: "Goa University" },
          { name: "National Institute of Oceanography" },
        ]
      },
      "Vasco da Gama": {
        colleges: [
          { name: "Goa Engineering College" },
          { name: "National Institute of Technology Goa" },
        ]
      }
    }
  }
};

export const indianStates = Object.keys(indiaEducationData).sort();

export const getCitiesForState = (state: string): string[] => {
  return state && indiaEducationData[state]
    ? Object.keys(indiaEducationData[state].cities).sort()
    : [];
};

export const getCollegesForCity = (state: string, city: string): CollegeEntry[] => {
  return state && city && indiaEducationData[state]?.cities[city]
    ? indiaEducationData[state].cities[city].colleges
    : [];
};
