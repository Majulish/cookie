
export const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };
  
  export const isValidDate = (day: number, month: number, year: number): boolean => {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  export const combineDateTimeToISO = (date: string, time: string): string => {
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes).toISOString();
  };

  
  export function parseISOString(isoString: string): { date: string; time: string } {
    // Create a Date object from the ISO string
    const dateObj = new Date(isoString);
    
    // Extract day, month, and year
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
    const year = dateObj.getFullYear();
    
    // Extract hours and minutes
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    // Format the date and time strings
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;
    
    // Return the object with formatted date and time
    return {
      date: formattedDate,
      time: formattedTime
    };
  }