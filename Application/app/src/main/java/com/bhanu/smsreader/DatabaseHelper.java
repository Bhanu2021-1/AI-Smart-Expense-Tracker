package com.bhanu.smsreader;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "expenses.db";
    private static final int DB_VERSION = 2; // Incremented for Phase 4 schema changes

    private static final String TABLE_NAME = "expenses";
    
    // Column Names
    public static final String COL_ID = "id";
    public static final String COL_AMOUNT = "amount";
    public static final String COL_NOTE = "note";
    public static final String COL_MERCHANT = "merchant";
    public static final String COL_CATEGORY = "category";
    public static final String COL_SMS_HASH = "sms_hash";
    public static final String COL_SYNC_STATUS = "sync_status"; // PENDING, SYNCED, FAILED
    public static final String COL_DATE = "date";

    public DatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_TABLE = "CREATE TABLE " + TABLE_NAME + "("
                + COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COL_AMOUNT + " TEXT,"
                + COL_NOTE + " TEXT,"
                + COL_MERCHANT + " TEXT,"
                + COL_CATEGORY + " TEXT,"
                + COL_SMS_HASH + " TEXT UNIQUE,"
                + COL_SYNC_STATUS + " TEXT,"
                + COL_DATE + " TEXT"
                + ")";
        db.execSQL(CREATE_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            // Migration: Add new columns to existing table
            db.execSQL("ALTER TABLE " + TABLE_NAME + " ADD COLUMN " + COL_MERCHANT + " TEXT");
            db.execSQL("ALTER TABLE " + TABLE_NAME + " ADD COLUMN " + COL_CATEGORY + " TEXT");
            db.execSQL("ALTER TABLE " + TABLE_NAME + " ADD COLUMN " + COL_SMS_HASH + " TEXT UNIQUE");
            db.execSQL("ALTER TABLE " + TABLE_NAME + " ADD COLUMN " + COL_SYNC_STATUS + " TEXT DEFAULT 'PENDING'");
            db.execSQL("ALTER TABLE " + TABLE_NAME + " ADD COLUMN " + COL_DATE + " TEXT");
        }
    }

    public long insertExpense(String amount, String note, String merchant, String category, String smsHash, String date, String status) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_AMOUNT, amount);
        values.put(COL_NOTE, note);
        values.put(COL_MERCHANT, merchant);
        values.put(COL_CATEGORY, category);
        values.put(COL_SMS_HASH, smsHash);
        values.put(COL_SYNC_STATUS, status);
        values.put(COL_DATE, date);

        long id = db.insert(TABLE_NAME, null, values);
        db.close();
        return id;
    }

    public boolean isSmsDuplicate(String smsHash) {
        if (smsHash == null || smsHash.isEmpty()) return false;
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_NAME, new String[]{COL_ID}, COL_SMS_HASH + "=?", new String[]{smsHash}, null, null, null);
        boolean exists = (cursor.getCount() > 0);
        cursor.close();
        db.close();
        return exists;
    }

    public void updateSyncStatus(long id, String status) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_SYNC_STATUS, status);
        db.update(TABLE_NAME, values, COL_ID + "=?", new String[]{String.valueOf(id)});
        db.close();
    }

    public Cursor getPendingExpenses() {
        SQLiteDatabase db = this.getReadableDatabase();
        return db.query(TABLE_NAME, null, COL_SYNC_STATUS + "=?", new String[]{"PENDING"}, null, null, COL_ID + " ASC");
    }

    public Cursor getAllExpenses() {
        SQLiteDatabase db = this.getReadableDatabase();
        return db.rawQuery("SELECT * FROM " + TABLE_NAME + " ORDER BY " + COL_ID + " DESC", null);
    }
}