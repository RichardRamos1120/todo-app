import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import sendEmail from '@/lib/sendEmail'; // Import the sendEmail function

export const GET = async (req) => {
    console.log('GET handler invoked');
    
    // Get today's date in YYYY-MM-DD format
    const todayDate = new Date().toISOString().split('T')[0];
    console.log('Querying todos with due_date:', todayDate);

    // Fetch todos with the current due date
    const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('due_date', todayDate);

    if (error) {
        console.error('Error fetching todos:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Todos fetched:', todos);

    if (todos.length === 0) {
        console.log('No todos found for today.');
    }

    // Send emails for each todo
    for (const todo of todos) {
        console.log(`Preparing to send email to ${todo.email} for todo "${todo.task}"`);
        
        const emailSubject = `Reminder: Your todo "${todo.task}" is due today!`;
        const emailBody = `Hi there,\n\nThis is a reminder that your todo "${todo.task}" is due today.\n\nBest regards,\nYour Todo App`;
        
        try {
            await sendEmail(
                process.env.EMAIL_FROM,
                todo.user_email, 
                emailSubject, 
                emailBody
            );
            console.log(`Email successfully sent to ${todo.email}`);
        } catch (error) {
            console.error(`Failed to send email to ${todo.email}:`, error);
        }
    }

    return NextResponse.json({ message: 'Emails sent' }, { status: 200 });
};
