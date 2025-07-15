export const matchFound = (transactionList: any[], tenant: any): boolean =>

    transactionList.some((tx: any) => {
        // 1️⃣ Normalize and compare names (case-insensitive)
        const firstNameTenant = tenant.name.split(" ")[0]?.toLowerCase();
        const nameTx = tx.name.replace("***", "").trim()?.toLowerCase();
        const nameMatch = nameTx.includes(firstNameTenant);
        
        // 2️⃣ Normalize and compare phone numbers
        

        const maskPhone = (phone: string) =>
            phone.slice(0, 4) + "***" + phone.slice(-3);
          
          const maskedTenantPhone = maskPhone(tenant.phone); // "0700***497"
          const normalizedTxPhone = tx.phone.replace("254", "0");
          
          const phoneMatch = maskedTenantPhone === normalizedTxPhone;
          const rentMatch = parseFloat(tx.paidIn) === parseFloat(tenant.rent_amount);
        // console.log(phoneTx, phoneTenant, phoneMatch)
        // // 3️⃣ Compare month from completionTime
        // const txMonth = new Date(tx.completionTime).toLocaleString('default', { month: 'long' })?.toLowerCase();
        // const monthMatch = txMonth === tenant.month?.toLowerCase();

        return nameMatch && phoneMatch && rentMatch;
    });
